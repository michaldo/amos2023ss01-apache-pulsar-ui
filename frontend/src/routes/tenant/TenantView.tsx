// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2023 Julian Tochman-Szewc <tochman-szewc@campus.tu-berlin.de>
// SPDX-FileCopyrightText: 2023 Shahraz Nasir <shahraz.nasir@campus.tu-berlin.de>
// SPDX-FileCopyrightText: 2023 Ziqi He <ziqi.he@fau.de>
import React, { useState } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { Collapse, CardActions, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { addFilterByDrilling, resetAllFilters } from '../../store/filterSlice'
import { useAppDispatch } from '../../store/hooks'
import axios from 'axios'
import { addCommaSeparator } from '../../Helpers'
import config from '../../config'
import { Topology } from '../../enum'

/**
 * The TenantView component displays tenant details.
 * It shows key properties of a tenant such as its name, info and numberOfNamespaces,
 * and allows for the navigation to the detailed view.
 *
 * @component
 * @param data - The data object containing the tenant information.
 * @returns a card including in-depth information regarding a specific tenant.
 */
const TenantView: React.FC<TenantViewProps> = ({ data }) => {
	const { name, tenantInfo, numberOfNamespaces, numberOfTopics }: TenantInfo =
		data

	const [expanded, setExpanded] = useState(false)
	const [details, setDetails] = useState<TenantDetail>()
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const fetchData = () => {
		const url = config.backendUrl + '/api/tenant/'

		// Sending GET request
		const params = {
			tenantName: name,
		}
		axios
			.get<TenantDetail>(url, { params })
			.then((response) => {
				setDetails(response.data)
			})
			.catch((error) => {
				console.log(error)
			})
	}

	const handleDrillDown = () => {
		dispatch(addFilterByDrilling({ filterName: Topology.TENANT, id: name }))
		navigate('/namespace')
	}
	const handleDrillUp = (itemId: string) => {
		dispatch(resetAllFilters())
		dispatch(addFilterByDrilling({ filterName: Topology.CLUSTER, id: itemId }))
		navigate('/cluster')
	}
	const handleDrillDownToNamespace = (itemId: string) => {
		dispatch(
			addFilterByDrilling({ filterName: Topology.NAMESPACE, id: itemId })
		)
		navigate('/namespace')
	}
	const handleExpand = () => {
		if (!details) fetchData()
		setExpanded(!expanded)
	}

	return (
		<div className="flex flex-col card-content">
			<h2 className="uppercase">{name}</h2>
			<div className="flex card-inner">
				<div className="flex flex-col card-col">
					<div className="flex card-info">
						<p className="text-black">
							Admin Roles:<br></br>
							<span className="text-grey">
								{tenantInfo.adminRoles && tenantInfo.adminRoles.length > 0 ? (
									tenantInfo.adminRoles.map((item: string, index: number) => (
										<span key={index}>
											{item}
											{addCommaSeparator(
												index,
												tenantInfo.adminRoles.length
											)}{' '}
										</span>
									))
								) : (
									<span>N/A </span>
								)}
							</span>
						</p>
						<p className="text-black">
							Allowed Clusters:<br></br>
							<span className="text-blue">
								{tenantInfo.allowedClusters &&
									tenantInfo.allowedClusters.length > 0 &&
									tenantInfo.allowedClusters.map(
										(item: string, index: number) => (
											<span key={index}>
												<a href="#" onClick={() => handleDrillUp(item)}>
													{item}
												</a>
												{addCommaSeparator(
													index,
													tenantInfo.allowedClusters.length
												)}{' '}
											</span>
										)
									)}
							</span>
						</p>
						<p className="text-black">
							Number of Namespaces:<br></br>
							<span className="text-grey">{numberOfNamespaces}</span>
						</p>
						<p className="text-black">
							Number of Topics:<br></br>
							<span className="text-grey">{numberOfTopics}</span>
						</p>
					</div>
					<div className="grey-line"></div>
				</div>
			</div>
			<div className="grey-line"></div>
			<Collapse in={expanded} timeout="auto" unmountOnExit>
				<div className="flex card-inner">
					<div className="flex flex-col card-col">
						<div className="flex card-info">
							{details?.namespaces.length !== 0 ? (
								<div className="items-list">
									<p className="text-black">Namespaces:</p>
									<ul>
										{details?.namespaces.map((item: string, index: number) => (
											<li key={index}>
												<span key={index} className="text-blue">
													<a
														href="#"
														onClick={() => handleDrillDownToNamespace(item)}
													>
														- {item}{' '}
													</a>
												</span>
											</li>
										))}
									</ul>
								</div>
							) : (
								<p className="text-black">
									Namespaces: <br></br>
									<span className="text-blue">None</span>
								</p>
							)}
						</div>
					</div>
				</div>
			</Collapse>
			<div className="flex justify-between card-buttons-container">
				{' '}
				<CardActions disableSpacing>
					{expanded ? (
						<Button
							variant={'contained'}
							className="outlined-button"
							onClick={handleExpand}
							endIcon={<ExpandLessIcon />}
						>
							Hide
						</Button>
					) : (
						<Button
							className="outlined-button"
							variant={'contained'}
							onClick={handleExpand}
							endIcon={<ExpandMoreIcon />}
						>
							Show details
						</Button>
					)}
					<Button
						endIcon={<ChevronRight />}
						variant={'contained'}
						onClick={handleDrillDown}
					>
						Drill down
					</Button>
				</CardActions>
			</div>
		</div>
	)
}

export default TenantView
