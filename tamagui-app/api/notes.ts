import { useEffect, useState } from "react"
import { randomUUID } from 'expo-crypto'
import * as SQLite from 'expo-sqlite'
import { ResultSetError } from "expo-sqlite"

export const ddl = `
  CREATE TABLE IF NOT EXISTS notes (
    uuid TEXT PRIMARY KEY NOT NULL,
    completed INT,
    description TEXT
  );
`

// export interface INote {
//   uuid: string
//   description: string
//   completed: boolean
// }

interface INotesGetAllFilters {
  completed?: boolean
}

export class Note {
  uuid: string
  description: string
  completed: boolean

  constructor(uuid: string, description: string, completed: boolean = false) {
    this.uuid = uuid
    this.description = description
    this.completed = completed
  }

  static async new (db: SQLite.SQLiteDatabase, description: string) {

    const query: SQLite.Query = {
      sql: `
        INSERT INTO notes (uuid, completed, description)
                   values (?,    0,         ?) 
      `,
      args: [
        randomUUID(),
        description
      ]
    }
  
    // Execute and wait to the query return
    const result = (await db.execAsync([query], false))[0]
  
    // execAsync can return `SQLite.ResultSetError` or `SQLite.ResultSet types`
    // this ensure that if SQLite.ResultSetError
    if ("error" in result) {
      throw result.error
    }
  
    return result.insertId !== 0
  }


  static async getAll (db: SQLite.SQLiteDatabase, filters: INotesGetAllFilters) {

    // Build the query
    const query: SQLite.Query = {
      sql: `
        SELECT
          uuid,
          completed,
          description
        
        FROM notes

        WHERE 1 = 1
        ${filters.completed !== undefined ? ` AND completed = ? ` : ``}
      `,
      args: [
        filters.completed
      ].filter(v => v !== undefined)
    }

    // Execute and wait to the query return
    const result = (await db.execAsync([query], true))[0]

    // execAsync can return `SQLite.ResultSetError` or `SQLite.ResultSet types`
    // this ensure that if SQLite.ResultSetError
    if ("error" in result) {
      throw result.error
    }

    const notes = result.rows.map(row => {
      return new this(
        uuid = row.uuid,
        description = row.description,
        completed = row.completed === 1
      )
    })


    return notes
  }

  async markCompleted (db: SQLite.SQLiteDatabase) {

    const query: SQLite.Query = {
      sql: `
        UPDATE notes 
           SET completed = 1
         WHERE uuid = ?
      `,
      args: [
        this.uuid
      ]
    }
  
    // Execute and wait to the query return
    const result = (await db.execAsync([query], false))[0]
  
    // execAsync can return `SQLite.ResultSetError` or `SQLite.ResultSet types`
    // this ensure that if SQLite.ResultSetError
    if ("error" in result) {
      throw result.error
    }

    console.debug(`Note ${this.uuid} marked as completed`)

    this.completed = true
  }

  async markIncompleted (db: SQLite.SQLiteDatabase) {

    const query: SQLite.Query = {
      sql: `
        UPDATE notes 
           SET completed = 0
         WHERE uuid = ?
      `,
      args: [
        this.uuid
      ]
    }
  
    // Execute and wait to the query return
    const result = (await db.execAsync([query], false))[0]
  
    // execAsync can return `SQLite.ResultSetError` or `SQLite.ResultSet types`
    // this ensure that if SQLite.ResultSetError
    if ("error" in result) {
      throw result.error
    }

    console.debug(`Note ${this.uuid} marked as incompleted`)

    this.completed = false
  }
}

export function useNotes (db: SQLite.SQLiteDatabase, completed: boolean | undefined) {

  const [notes, setNotes] = useState<Note[]>([])
  const [notesError, setNotesError] = useState<any>()
  const [notesIsLoading, setNotesIsLoading] = useState(false)

  async function notesRevalidate () {
    setNotesIsLoading(true)

    try {
      const notes = await Note.getAll(
        db, 
        {
          completed
        }
      )

      setNotes(notes)
    } catch (err) {
      setNotesError(err)
    }

    setNotesIsLoading(false)
  }

  useEffect(() => {
    notesRevalidate()
  }, [completed])

  return {
    notes,
    notesError,
    notesIsLoading,
    notesRevalidate
  }
}

