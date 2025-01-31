// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2023 Julian Tochman-Szewc <tochman-szewc@campus.tu-berlin.de>
// SPDX-FileCopyrightText: 2023 Shahraz Nasir <shahraz.nasir@campus.tu-berlin.de>
// SPDX-FileCopyrightText: 2023 Ziqi He <ziqi.he@fau.de>
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import axios from 'axios'
import { ResponseCluster } from '../routes/cluster'
import { ResponseTenant } from '../routes/tenant'
import { ResponseNamespace } from '../routes/namespace'
import { ResponseTopic } from '../routes/topic'
import config from '../config'
import { Topology } from '../enum'

export type FilterState = {
	// used to keep track of what currently is filtered and what not:
	cluster: string[]
	tenant: string[]
	namespace: string[]
	topic: string[]
	producer: string[]
	subscription: string[]
	// used for displaying the options in the filter dropdowns:
	displayedOptions: {
		allClusters: string[]
		allTenants: string[]
		allNamespaces: string[]
		allTopics: string[]
		allProducers: string[]
		allSubscriptions: string[]
	}
	view: UpdateSingleFilter['filterName']
}

export type UpdateSingleFilter = {
	filterName: Topology
	id: string
}

const initialState: FilterState = {
	cluster: [],
	tenant: [],
	namespace: [],
	topic: [],
	producer: [],
	subscription: [],
	displayedOptions: {
		allClusters: [],
		allTenants: [],
		allNamespaces: [],
		allTopics: [],
		allProducers: [],
		allSubscriptions: [],
	},
	view: Topology.CLUSTER,
}

const backendInstance = axios.create({
	baseURL: config.backendUrl + '/api',
	timeout: 5000,
})

/**
 * Fetches the general cluster information of cluster/all for filter options
 * @returns {ResponseCluster} - unedited data from endpoint
 */
const clusterOptionThunk = createAsyncThunk(
	'filterController/clusterOption',
	async () => {
		const response = await backendInstance.get('/cluster/all')
		return response.data
	}
)

/**
 * Fetches the general tenant information of tenant/all for filter options
 * @returns {ResponseTenant} - unedited data from endpoint
 */
const tenantOptionThunk = createAsyncThunk(
	'filterController/tenantOption',
	async () => {
		const response = await backendInstance.get('/tenant/all')
		return response.data
	}
)

/**
 * Fetches the general namespace information of namespace/all for filter options
 * @returns {ResponseNamespace} - unedited data from endpoint
 */
const namespaceOptionThunk = createAsyncThunk(
	'filterController/namespaceOption',
	async () => {
		const response = await backendInstance.get('/namespace/all')
		return response.data
	}
)

/**
 * Fetches the general topic information of topic/all for filter options
 * @returns {ResponseTopic} - unedited data from endpoint
 */
const topicOptionThunk = createAsyncThunk(
	'filterController/topicOption',
	async () => {
		const response = await backendInstance.get('/topic/all')
		return response.data
	}
)

/**
 * Dispatches all option thunks to fill the filter option arrays with information
 */
const fetchOptionsThunk = createAsyncThunk(
	'filterController/fetchOptions',
	async (_, thunkAPI) => {
		const { dispatch } = thunkAPI
		// dispatch both thunks and wait for them to complete
		await Promise.all([
			dispatch(clusterOptionThunk()),
			dispatch(tenantOptionThunk()),
			dispatch(namespaceOptionThunk()),
			dispatch(topicOptionThunk()),
		])
	}
)

const filterSlice = createSlice({
	name: 'filterControl',
	initialState,
	reducers: {
		setCluster: (state, action: PayloadAction<string[]>) => {
			state.cluster = action.payload
		},
		setTenant: (state, action: PayloadAction<string[]>) => {
			state.tenant = action.payload
		},
		setNamespace: (state, action: PayloadAction<string[]>) => {
			state.namespace = action.payload
		},
		setTopic: (state, action: PayloadAction<string[]>) => {
			state.topic = action.payload
		},
		setProducer: (state, action: PayloadAction<string[]>) => {
			state.producer = action.payload
		},
		setSubscription: (state, action: PayloadAction<string[]>) => {
			state.subscription = action.payload
		},
		// Adds an Id to one single filter array (cluster, tenant, namespace, topic)
		addFilter: (state, action: PayloadAction<UpdateSingleFilter>) => {
			const filterName = action.payload.filterName
			state[filterName].push(action.payload.id)
		},
		// Adds query to one single
		addFilterWithRadio: (state, action: PayloadAction<UpdateSingleFilter>) => {
			const filterName = action.payload.filterName
			state[filterName] = []
			state[filterName].push(action.payload.id)
		},
		// Deletes Id from one single filter array (cluster, tenant, namespace, topic)
		deleteFilter: (state, action: PayloadAction<UpdateSingleFilter>) => {
			const filterName = action.payload.filterName
			const query = action.payload.id
			state[filterName] = state[filterName].filter((element) => {
				return element !== query
			})
		},
		// Adds Id to a filter array while resetting all other Id's in it. Specifically needed for Drill Down Buttons
		addFilterByDrilling: (state, action: PayloadAction<UpdateSingleFilter>) => {
			state[action.payload.filterName] = initialState[action.payload.filterName]
			state[action.payload.filterName] = [action.payload.id]
		},
		// Resets all filter arrays / applied filters to initial state
		resetAllFilters: (state) => {
			// only the filter arrays are affected
			state.cluster = initialState.cluster
			state.tenant = initialState.tenant
			state.namespace = initialState.namespace
			state.topic = initialState.topic
			state.producer = initialState.producer
			state.subscription = initialState.subscription
		},
		// the filtering of lower views does not apply to higher views,
		// those filters shall be reset when the user "goes up".
		updateFilterAccordingToNav: (
			state,
			action: PayloadAction<UpdateSingleFilter['filterName']>
		) => {
			const lastView = state.view
			const currentView = action.payload
			const pulsarHierarchyArr: UpdateSingleFilter['filterName'][] = [
				Topology.CLUSTER,
				Topology.TENANT,
				Topology.NAMESPACE,
				Topology.TOPIC,
				Topology.PRODUCER,
				Topology.SUBSCRIPTION,
			]
			const currentViewLevel = pulsarHierarchyArr.indexOf(currentView)
			const lastViewLevel = pulsarHierarchyArr.indexOf(lastView)
			// If the user goes to upper level in the pulasr hierarchy,
			// reset all filters below that "upper level".
			if (currentViewLevel < lastViewLevel) {
				const filtersToReset = pulsarHierarchyArr.slice(currentViewLevel + 1)
				// Resets all filters bellow the current view level.
				filtersToReset.forEach((filterName) => {
					state[filterName] = initialState[filterName]
				})
			}
			state.view = currentView
		},
	},
	extraReducers(builder) {
		builder.addCase(clusterOptionThunk.fulfilled, (state, action) => {
			const data: ResponseCluster = JSON.parse(JSON.stringify(action.payload))
			state.displayedOptions.allClusters = data.clusters.map(
				(cluster) => cluster.name
			)
		})
		builder.addCase(tenantOptionThunk.fulfilled, (state, action) => {
			const data: ResponseTenant = JSON.parse(JSON.stringify(action.payload))
			state.displayedOptions.allTenants = data.tenants.map((item) => item.name)
		})
		builder.addCase(namespaceOptionThunk.fulfilled, (state, action) => {
			const data: ResponseNamespace = JSON.parse(JSON.stringify(action.payload))
			state.displayedOptions.allNamespaces = data.namespaces.map(
				(item) => item.id
			)
		})
		builder.addCase(topicOptionThunk.fulfilled, (state, action) => {
			const data: ResponseTopic = JSON.parse(JSON.stringify(action.payload))
			data.topics.forEach((topic) => {
				if (topic.producers) {
					state.displayedOptions.allProducers.push(...topic.producers)
					state.displayedOptions.allProducers =
						state.displayedOptions.allProducers
							.filter((e) => e !== 'undefined')
							.filter((element, index) => {
								return (
									state.displayedOptions.allProducers.indexOf(element) === index
								)
							})
				}
				if (topic.subscriptions) {
					state.displayedOptions.allSubscriptions.push(...topic.subscriptions)
					state.displayedOptions.allSubscriptions =
						state.displayedOptions.allSubscriptions
							.filter((e) => e !== 'undefined')
							.filter((element, index) => {
								return (
									state.displayedOptions.allSubscriptions.indexOf(element) ===
									index
								)
							})
				}
			})
			state.displayedOptions.allTopics = data.topics.map((item) => item.name)
		})
		builder.addCase(fetchOptionsThunk.rejected, () => {
			console.log('Fetching filters did not work. Reload!')
		})
	},
})

// Selectors
const selectCluster = (state: RootState): string[] => {
	return state.filterControl.cluster
}
const selectTenant = (state: RootState): string[] => {
	return state.filterControl.tenant
}
const selectNamespace = (state: RootState): string[] => {
	return state.filterControl.namespace
}
const selectTopic = (state: RootState): string[] => {
	return state.filterControl.topic
}

const selectProducer = (state: RootState): string[] => {
	return state.filterControl.producer
}

const selectSubscription = (state: RootState): string[] => {
	return state.filterControl.subscription
}

/**
 * Selects/returns all available filter options from the state
 * @param state - current state
 * @returns Filter Options
 */
const selectOptions = (
	state: RootState
): {
	allClusters: string[]
	allTenants: string[]
	allNamespaces: string[]
	allTopics: string[]
	allProducers: string[]
	allSubscriptions: string[]
} => {
	return state.filterControl.displayedOptions
}
/**
 * Selects/returns all applied filters from the state
 * @param state - current state
 * @returns Applied filters
 */
const selectAllFilters = (
	state: RootState
): {
	cluster: string[]
	tenant: string[]
	namespace: string[]
	topic: string[]
	producer: string[]
	subscription: string[]
} => {
	return {
		cluster: state.filterControl.cluster,
		tenant: state.filterControl.tenant,
		namespace: state.filterControl.namespace,
		topic: state.filterControl.topic,
		producer: state.filterControl.producer,
		subscription: state.filterControl.subscription,
	}
}

export {
	selectCluster,
	selectNamespace,
	selectTenant,
	selectTopic,
	selectProducer,
	selectSubscription,
	selectOptions,
	selectAllFilters,
	fetchOptionsThunk,
}

export const {
	setCluster,
	setTenant,
	setNamespace,
	setTopic,
	setProducer,
	setSubscription,
	addFilter,
	addFilterWithRadio,
	deleteFilter,
	addFilterByDrilling,
	resetAllFilters,
	updateFilterAccordingToNav,
} = filterSlice.actions

export default filterSlice.reducer
