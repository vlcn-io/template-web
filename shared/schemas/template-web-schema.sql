CREATE TABLE IF NOT EXISTS issue (
    id TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

SELECT crsql_as_crr('issue');

-- set up a full text index for issues
-- just to show it is possible
CREATE VIRTUAL TABLE issue_fts IF NOT EXISTS USING fts5(title, description, status, content=issue, content_rowid=id);

-- Triggers to keep the FTS index up to date.
CREATE TRIGGER issue_ai AFTER INSERT ON tbl BEGIN
  INSERT INTO issue_fts(rowid, title, description, status) VALUES (new.id, new.title, new.description, new.status);
END;
CREATE TRIGGER issue_ad AFTER DELETE ON tbl BEGIN
  INSERT INTO issue_fts(fts_idx, rowid, title, description, status)
    VALUES('delete', old.id, old.title, old.description, old.status);
END;
CREATE TRIGGER issue_au AFTER UPDATE ON tbl BEGIN
  INSERT INTO issue_fts(fts_idx, rowid, title, description, status)
    VALUES('delete', old.id, old.title, old.description, old.status);
  INSERT INTO issue_fts(rowid, title, description, status) VALUES (new.id, new.title, new.description, new.status);
END;
