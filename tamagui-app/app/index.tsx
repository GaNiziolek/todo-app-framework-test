import React, { useEffect, useRef, useState } from "react"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

import {
  FlatList,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from "react-native"

import {
  Checkbox,
  Input,
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
  const [filterCompleted, setFilterCompleted] = useState<boolean>()

  
  useEffect(() => {
    Database.ensureTablesExists(db)
  }, [])

  const {
    notes,
    notesRevalidate 
  } = useNotes(db, filterCompleted)

  async function handleItemCheckboxPress (pressedNote: Note) {
    if (pressedNote.completed) {
      await pressedNote.markIncompleted(db)
    } else {
      await pressedNote.markCompleted(db)
    }
    await notesRevalidate()
  }

  async function handleNoteDeleteBtnPress (pressedNote: Note) {

    await pressedNote.delete(db)
    await notesRevalidate()
  }

  async function handleInsertNewNote (submitEvent: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {

    if (newNoteDescription === '') return
    if (newNoteDescription.trim() === '') return
    
    await Note.new(db, newNoteDescription)
    await notesRevalidate()

    // Clear input
    setNewNoteDescription("")
  }

  function Item (info: ListRenderItemInfo<Note>) {

    return (
      <XStack space="$3" marginVertical="$3" alignItems="center">

        <Checkbox
          checked={info.item.completed}
          onCheckedChange={() => handleItemCheckboxPress(info.item)}
        >
          <Checkbox.Indicator>
            <MaterialCommunityIcons name="check"/>
          </Checkbox.Indicator>
        </Checkbox>

        <Text flex={1}>
          {info.item.description}
        </Text>

        <Button
          chromeless
          icon={<MaterialCommunityIcons name="close" size={16}/>}
          size="$2"
          onPress={() => handleNoteDeleteBtnPress(info.item)}
        />

      </XStack>
    )
  }
  
  function Separator () {
    return (
      <Stack w="full" h={1} bg="$gray8"/>
    )
  }

  return (
    <YStack p="$5" space="$4" height={"100%"}>

      <YStack space="$4">
        <Input
          value={newNoteDescription}
          onChangeText={setNewNoteDescription}
          onSubmitEditing={handleInsertNewNote}
          placeholder="Type your note here"
        />

        <XGroup>
          <Button
            f={1}
            chromeless
            onPress={() => setFilterCompleted(undefined)}
            isPressed={filterCompleted === undefined}
          >
            All
          </Button>

          <Button
            f={1}
            chromeless
            onPress={() => setFilterCompleted(false)}
            isPressed={filterCompleted === false}
          >
            Pending
          </Button>

          <Button
            f={1}
            chromeless
            onPress={() => setFilterCompleted(true)}
            isPressed={filterCompleted === true}
          >
            Completed
          </Button>
        </XGroup>

      </YStack>

      <YStack flex={1}>
        <FlatList
          contentContainerStyle={{
          }}
          data={notes}
          renderItem={Item}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={Separator}
        />
      </YStack>

    </YStack>
  )
}