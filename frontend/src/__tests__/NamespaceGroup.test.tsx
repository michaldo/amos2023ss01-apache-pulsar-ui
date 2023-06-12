import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import store from '../store'
import NamespaceView from '../components/pages/namespace/NamespaceView'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

const dataTest: Array<NamespaceInfo> = [
	{
		id: 'amos-namespace-2',
		tenant: 'amos-tenant-2',
	},
	{
		id: 'amos-namespace-3',
		tenant: 'amos-tenant-3',
	},
	{
		id: 'amos-namespace-4',
		tenant: 'amos-tenant-4',
	},
]

test('should check if data is being displayed in the NamespaceGroup', async () => {
	//store.dispatch(setClusterDataTEST(dataTest))

	render(
		<Router>
			<Routes>
				<Route
					path="/"
					element={
						<Provider store={store}>
							<div data-testid="main-namespacegroup">
								<h2 className="dashboard-title">Available Namespaces</h2>
								<div>
									{dataTest.map((namespace, index) => (
										<div className="main-card" key={index}>
											<NamespaceView key={index} data={namespace} />
										</div>
									))}
								</div>
							</div>
						</Provider>
					}
				></Route>
			</Routes>
		</Router>
	)
	expect(screen.getByTestId('main-namespacegroup')).toHaveTextContent(
		'amos-namespace-2'
	)
	expect(screen.getByTestId('main-namespacegroup')).toHaveTextContent(
		'Tenant: amos-tenant-2'
	)
})
