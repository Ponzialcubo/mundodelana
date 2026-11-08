"""Creates the draft products from plan.py through the admin API and updates the library statuses."""
import json, sys, urllib.request, subprocess
sys.path.insert(0, sys.argv[1]); from plan import PRODUCTS, EXISTING, GALLERY, DISCARD
S = sys.argv[1]; DRY = "--apply" not in sys.argv
idx = {x["n"]: x for x in json.load(open(f"{S}/index.json"))}
lib = {m["id"]: m for m in json.load(open(f"{S}/library.json"))}
meta = open(f"{S}/meta.txt").read().strip().split("\n")
cat_ids, slugs = json.loads(meta[0]), set(json.loads(meta[1]))
cookie = open(sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else f"{S}/cookie").read().strip()

def api(path, body):
    req = urllib.request.Request(f"https://mundolana.es{path}", json.dumps(body).encode(), {"Content-Type": "application/json", "Cookie": cookie})
    with urllib.request.urlopen(req) as r: return json.loads(r.read() or b"{}")

used, problems = set(), []
for p in PRODUCTS:
    ids = []
    for n in p["posts"] + p.get("extra_from", []):
        ids += [i for i in idx[n]["ids"] if i not in ids]
    media = [lib[i] for i in ids]
    cover = next((m for m in media if m["type"] == "IMAGE"), None)
    if not cover: problems.append(f"{p['name']}: sin foto"); continue
    if p["slug"] in slugs: problems.append(f"{p['name']}: slug repetido"); continue
    if any(c not in cat_ids for c in p["cats"]): problems.append(f"{p['name']}: categoría"); continue
    payload = dict(name=p["name"], slug=p["slug"], shortDescription=p["short"], description=p["desc"], materials=p["materials"],
        metaTitle="", metaDescription="", publicationStatus="BORRADOR", pieceStatus="DISPONIBLE", featured=False,
        priceType="PERSONALIZADO", price=0, instagramUrl=lib[idx[p["posts"][0]]["ids"][0]]["permalink"] or "", tiktokUrl="",
        categoryIds=[cat_ids[c] for c in p["cats"]], brandIds=[], relatedIds=[],
        mainImage=cover["url"], mainImageFocalX=0.5, mainImageFocalY=0.5,
        images=[dict(url=m["url"], mediaType=m["type"], posterUrl=m["poster"], focalX=0.5, focalY=0.5) for m in media if m is not cover])
    slugs.add(p["slug"]); used.update(ids)
    print(f"{'DRY' if DRY else 'OK '} {p['name']:<42} {len(media):>2} fotos  {', '.join(p['cats'])}")
    if not DRY: api("/api/admin/productos", payload)

for n in EXISTING: used.update(idx[n]["ids"])
discard = [i for n in DISCARD for i in idx[n]["ids"]]
gallery = {i: t for n, t in GALLERY.items() for i in idx[n]["ids"][:1]}
used.update(gallery)
print(f"\nproductos: {len(PRODUCTS)}  fotos usadas: {len(used)}  descartadas: {len(discard)}  galería: {len(gallery)}  sin asignar: {len(set(lib) - used - set(discard))}")
print("problemas:", problems or "ninguno")
if not DRY:
    api("/api/admin/biblioteca/estado", {"ids": sorted(used), "status": "USADA"})
    api("/api/admin/biblioteca/estado", {"ids": discard, "status": "DESCARTADA"})
    sql = "".join(f"update \"LibraryMedia\" set \"showInGallery\"=true, \"galleryTitle\"='{t}' where id='{i}';" for i, t in gallery.items())
    subprocess.run(["docker", "exec", "mundodelana-db-1", "sh", "-c", f'psql -U $POSTGRES_USER -d $POSTGRES_DB -qc "{sql.replace(chr(34), chr(92)+chr(34))}"'], check=True)
