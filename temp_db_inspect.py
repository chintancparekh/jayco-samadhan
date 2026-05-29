import sqlite3
from pathlib import Path
path = Path('SafecoreApi/dev.db')
print('exists', path.exists())
if not path.exists():
    raise SystemExit(1)
conn = sqlite3.connect(path)
cur = conn.cursor()
for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table';"):
    print('table', row[0])
print('-----')
for tbl in ['Users','Accounts','Case','Cases','Query','Queries','Grievance','Grievances']:
    try:
        cur.execute(f"SELECT * FROM {tbl} LIMIT 5")
        cols = [d[0] for d in cur.description]
        print('TABLE', tbl, 'cols', cols)
        for r in cur.fetchall():
            print(r)
    except Exception as e:
        print('skip', tbl, e)
conn.close()
