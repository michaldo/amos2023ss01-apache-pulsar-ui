// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2023 Julian Tochman-Szewc <tochman-szewc@campus.tu-berlin.de>
// SPDX-FileCopyrightText: 2023 Shahraz Nasir <shahraz.nasir@campus.tu-berlin.de>
// SPDX-FileCopyrightText: 2023 Ziqi He <ziqi.he@fau.de>
import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { useAppDispatch } from '../store/hooks'
import { setNav } from '../store/globalSlice'
import logo from '../assets/images/team-logo-light.png'
import { InfoModal } from './modals/InfoModal'
import { useLocation, useNavigate } from 'react-router-dom'
import { updateFilterAccordingToNav } from '../store/filterSlice'
import { Topology } from '../enum'

const pages = [
	Topology.CLUSTER,
	Topology.TENANT,
	Topology.NAMESPACE,
	Topology.TOPIC,
]

/**
 * The NavBar component provides a navigational bar interface.
 * It manages navigation menu state and provides handlers for opening and closing Modals as well as clicking on navigation items.
 * The NavBar renders AppBar which contains navigation options for different pages.
 * It also contains the InfoModal component.
 *
 * @component
 * @returns a styled navbar that allows users to switch between different topology pages.
 */
const NavBar: React.FC = () => {
	const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)

	const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget)
	}
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const location = useLocation()

	const handleCloseNavMenu = () => {
		setAnchorElNav(null)
	}

	// Handles click on navigation items
	const handleClickOnNav = (tag: Topology) => {
		dispatch(setNav(tag))
		navigate('/' + tag)
	}

	return (
		<AppBar position="static">
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<img
						className="home-logo"
						src={logo}
						alt="logo"
						style={{
							maxHeight: '70px',
							maxWidth: '70px',
							verticalAlign: 'middle',
						}}
					/>
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleOpenNavMenu}
							color="inherit"
						>
							<MenuIcon />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: 'block', md: 'none' },
							}}
						>
							{pages.map((page) => (
								<MenuItem
									key={page}
									disabled={page.toLowerCase() == location.pathname.slice(1)}
									onClick={() => {
										handleClickOnNav(page)
										updateFilterAccordingToNav(page)
									}}
								>
									<Typography textAlign="center">{page}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
					<Box
						sx={{
							flexGrow: 1,
							display: { xs: 'none', md: 'flex' },
							justifyContent: 'center',
						}}
					>
						{pages.map((page) => (
							<Button
								key={page}
								disabled={page.toLowerCase() == location.pathname.slice(1)}
								onClick={() => {
									handleClickOnNav(page)
									dispatch(updateFilterAccordingToNav(page))
								}}
								sx={{ my: 2, color: 'white', display: 'block' }}
							>
								{page}
							</Button>
						))}
					</Box>
					<InfoModal />
				</Toolbar>
			</Container>
		</AppBar>
	)
}
export default NavBar
