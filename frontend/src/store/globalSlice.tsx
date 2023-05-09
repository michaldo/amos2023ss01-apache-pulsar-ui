// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2010-2021 Dirk Riehle <dirk@riehle.org
// SPDX-FileCopyrightText: 2019 Georg Schwarz <georg. schwarz@fau.de>

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { RootState } from '.'

export type globalState = {
	data: Array<MessageList>
}

const initialState: globalState = {
	data: [],
}

const backendInstance = axios.create({
	baseURL: 'https://127.0.0.1/8081',
	timeout: 1000,
})

const fetchDataThunk = createAsyncThunk(
	'formController/fetchData',
	async () => {
		const response = await backendInstance.get('/data')
		return response.data
	}
)

interface UpdateForData {
	message: string
	topic: string
}

// eslint-disable-next-line
const globalSlice = createSlice({
	name: 'globalControl',
	initialState,
	reducers: {
		setData: (
			state: globalState,
			action: PayloadAction<Array<MessageList>>
		) => {
			state.data = action.payload
		},
		updateData: (state: globalState, action: PayloadAction<UpdateForData>) => {
			state.data.map((single: MessageList) => {
				if (single.id === action.payload.topic) {
					const tempId = action.payload.topic + (single.messages.length + 1)
					const newMessage = {
						id: tempId,
						value: action.payload.message,
						topic: action.payload.topic,
					}
					single.messages = [...single.messages, newMessage]
				}
				return single
			})
		},
	},
})

const { actions, reducer } = globalSlice

const selectData = (state: RootState): Array<MessageList> =>
	state.globalControl.data

export const { updateData, setData } = actions

export { selectData, fetchDataThunk }

export default reducer
