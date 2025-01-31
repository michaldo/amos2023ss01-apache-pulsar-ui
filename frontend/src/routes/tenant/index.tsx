// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2023 Julian Tochman-Szewc <tochman-szewc@campus.tu-berlin.de>
// SPDX-FileCopyrightText: 2023 Shahraz Nasir <shahraz.nasir@campus.tu-berlin.de>
// SPDX-FileCopyrightText: 2023 Ziqi He <ziqi.he@fau.de>
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import axios from 'axios'
import { selectCluster, selectTenant } from '../../store/filterSlice'
import TenantView from './TenantView'
import { selectTrigger } from '../requestTriggerSlice'
import config from '../../config'
import { Masonry } from 'react-plock'
import FlushCacheButton from '../../components/buttons/FlushCacheButton'

export interface ResponseTenant {
	tenants: TenantInfo[]
}

/**
 * The TenantGroup component groups the tenants included within the dashboard inside a masonry.
 * Displays the TenantView cards, title, loading window and network error.
 *
 * @component
 * @returns a masonry containing TenantView cards.
 */
const TenantGroup: React.FC = () => {
	const [data, setData] = useState<TenantInfo[]>([])
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const clusterFilter = useAppSelector(selectCluster)
	const tenantFilter = useAppSelector(selectTenant)
	const baseURL = config.backendUrl + '/api/tenant/all'
	const trigger = useAppSelector(selectTrigger)

	// Sends get request to /cluster/all for general information everytime the trigger value changes
	useEffect(() => {
		// Query parameters
		const clusterQuery = clusterFilter
			.map((cluster) => `clusters=${cluster}`)
			.join('&')
		const tenantQuery = tenantFilter
			.map((tenant) => `tenants=${tenant}`)
			.join('&')

		// Joining all query parameters
		const query = [clusterQuery, tenantQuery].filter((q) => q).join('&')
		const url = `${baseURL}?${query}`
		// Sending GET request
		axios
			.get<ResponseTenant>(url)
			.then((response) => {
				setData(response.data.tenants)
				setLoading(false)
			})
			.catch((error) => {
				setError(error.message)
				setLoading(false)
			})
	}, [trigger])

	return (
		<div>
			<div className="flex dashboard-header">
				<div>
					<h2 className="dashboard-title">Available Tenants ({data.length})</h2>
					<h3 className="dashboard-subtitle">
						Namespaces: {sumElements(data, 'numberOfNamespaces')}, Topics:{' '}
						{sumElements(data, 'numberOfTopics')}
					</h3>
				</div>
				<FlushCacheButton />
			</div>
			{loading ? (
				<div className="main-card"> Loading...</div>
			) : error ? (
				<div>Error: {error}</div>
			) : (
				<Masonry
					className="main-card-wrapper"
					items={data}
					config={{
						columns: [1, 2],
						gap: [34, 34],
						media: [1619, 1620],
					}}
					render={(tenant, index) => (
						<div className="main-card" key={index}>
							<TenantView key={index} data={tenant} />
						</div>
					)}
				/>
			)}
		</div>
	)
}

const sumElements = (
	tenants: TenantInfo[],
	field: 'numberOfNamespaces' | 'numberOfTopics'
) => tenants.map((element) => element[field]).reduce((a, b) => a + b, 0)

export default TenantGroup
