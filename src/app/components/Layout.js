"use client";

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Divider,
  CssBaseline,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import CampaignIcon from "@mui/icons-material/Campaign";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from "@mui/icons-material/Badge";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const drawerWidth = 240;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // Control de la barra lateral
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" }); // Cierra sesión y redirige al login
  };

  const isAdmin = session?.user?.rol === "admin" || session?.user?.rol === "admin_general";
  console.log("Rol", session?.user?.rol)

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#254e59",
        color: "#fff",
      }}
    >
      <Toolbar>
        <Avatar
          src=" "
          alt="Usuario"
          sx={{ width: 60, height: 60, mx: "auto" }}
        />
      </Toolbar>
      <Divider sx={{ bgcolor: "#254e59" }} />
      <List>
        {isAdmin && (
          <ListItem
            button="true"
            onClick={() => router.push("/admin")}
            sx={{
              "&:hover": { bgcolor: "#2D3748" },
              px: 3,
              py: 1.5,
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Admin" />
          </ListItem>
        )}
        {/*<ListItem
          button="true"
          onClick={() => router.push("/leads")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <ContactPageIcon />
          </ListItemIcon>
          <ListItemText primary="Leads" />
        </ListItem>*/}
        <ListItem
          button="true"
          onClick={() => router.push("/clientes")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Clientes" />
        </ListItem>
        <ListItem
          button="true"
          onClick={() => router.push("/dashboard")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        {/*
        <ListItem
          button="true"
          onClick={() => router.push("/settings")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItem>
          */}
        {/*
        <ListItem
          button="true"
          onClick={() => router.push("/gestores")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <BadgeIcon />
          </ListItemIcon>
          <ListItemText primary="Gestores" />
        </ListItem>*/}
        <ListItem
          button="true"
          onClick={() => router.push("/promesasPago")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <CalendarMonthIcon />
          </ListItemIcon>
          <ListItemText primary="Promesas de Pago" />
        </ListItem>
        <ListItem
          button="true"
          onClick={() => router.push("/campaigns")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <CampaignIcon />
          </ListItemIcon>
          <ListItemText primary="Campañas" />
        </ListItem>
        <ListItem
          button="true"
          onClick={() => router.push("/usuarios")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Usuarios" />
        </ListItem>
      </List>
      <Divider sx={{ bgcolor: "#2D3748" }} />
      <List>
        <ListItem
          button="true"
          onClick={handleLogout}
          sx={{
            "&:hover": { bgcolor: "#E53E3E" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "auto" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "#007391",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            CRM  DE REACTIVACIONES
          </Typography>
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <NotificationsIcon />
          </IconButton>
          <Avatar
            alt="Usuario"
            src="https://trasplantecapilar.pe/wp-content/uploads/2024/09/logo-ifc.jpg"
          />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: isDrawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          transition: "width 0.3s",
        }}
        aria-label="menu"
      >
        <Drawer
          variant="permanent"
          open={isDrawerOpen}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: isDrawerOpen ? drawerWidth : 0,
              overflowX: "hidden",
              transition: "width 0.3s",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin-left 0.3s",
          bgcolor: "#F7FAFC",
          height: "100%",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}