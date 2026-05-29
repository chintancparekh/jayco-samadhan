import sqlite3, pathlib
path = pathlib.Path('SafecoreApi/dev.db')
conn = sqlite3.connect(path)
cur = conn.cursor()
rows = list(cur.execute('SELECT Id, Name, Email, Password FROM Users'))
print('count', len(rows))
for row in rows: print(row)
conn.close()
