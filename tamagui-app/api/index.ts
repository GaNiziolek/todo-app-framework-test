import * as SQLite from 'expo-sqlite'
import * as Notes from '@/api/notes'

export function openDatabase () {
  return SQLite.openDatabase('db.db')
}

export function ensureTablesExists (db: SQLite.SQLiteDatabase) {
  
  const tablesDdl = [
    Notes.ddl
  ]

  db.transaction((tx) => {
    tablesDdl.forEach((ddl) => tx.executeSql(ddl))
  })

}