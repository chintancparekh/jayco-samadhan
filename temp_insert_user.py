import sqlite3, pathlib
path = pathlib.Path('SafecoreApi/dev.db')
conn = sqlite3.connect(path)
cur = conn.cursor()
cur.execute("INSERT INTO Users (Name, Email, Gst, Mobile, Password) VALUES (?,?,?,?,?)", ('Test User','test@safecore.local','GST123','9999999999','Password123'))
conn.commit()
for row in cur.execute('SELECT Id, Name, Email, Password FROM Users'): print(row)
conn.close()
