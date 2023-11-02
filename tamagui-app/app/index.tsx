import React, { useEffect, useRef, useState } from "react"
import { randomUUID } from 'expo-crypto'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

import {
  FlatList,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData
} from "react-native"

import {
  ButtonIcon,
  Checkbox,
  Input,
  ScrollView,
  Stack,
  Text,
  XGroup,
  XStack,
  YStack
} from "tamagui"

import { Button } from "@/components/Button"

import * as Database from '@/api/index'

import {
  Note,
  useNotes
} from "@/api/notes"

const db = Database.openDatabase()

export default function App () {

  const [newNoteDescription, setNewNoteDescription] = useState("")

  
  useEffect(() => {
    Database.ensureTablesExists(db)
  }, [])

  const {
    notes,
    notesRevalidate 
  } = useNotes(db)

  async function handleItemCheckboxPress (pressedNote: Note) {
    if (pressedNote.completed) {
      await pressedNote.markIncompleted(db)
    } else {
      await pressedNote.markCompleted(db)
    }
    await notesRevalidate()
  }

  async function handleInsertNewNote (submitEvent: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {

    const newNote: Note = {
      uuid: randomUUID(),
      description: newNoteDescription,
      completed: false
    }

    setNewNoteDescription("")

    await Note.new(db, newNoteDescription)
    await notesRevalidate()
  }

  function Item (info: ListRenderItemInfo<Note>) {

    return (
      <XStack space="$3" marginVertical="$4">

        <Checkbox
          checked={info.item.completed}
          onCheckedChange={() => handleItemCheckboxPress(info.item)}
        >
          <Checkbox.Indicator>
            <MaterialCommunityIcons name="check"/>
          </Checkbox.Indicator>
        </Checkbox>

        <Text>
          {info.item.description}
        </Text>

      </XStack>
    )
  }
  
  function Separator () {
    return (
      <Stack w="full" h={1} bg="$gray8"/>
    )
  }

  return (
    <YStack p="$5" space="$4">

      <YStack space="$4">
        <Input
          value={newNoteDescription}
          onChangeText={setNewNoteDescription}
          onSubmitEditing={handleInsertNewNote}
        />

        <XGroup>
          <Button f={1} chromeless isPressed>
            All
          </Button>

          <Button f={1} chromeless>
            Pending
          </Button>

          <Button f={1} chromeless>
            Completed
          </Button>
        </XGroup>

      </YStack>

      <FlatList
        data={notes}
        renderItem={Item}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={Separator}
        style={{
          height: "100%"
        }}
      />

    </YStack>
  )
}