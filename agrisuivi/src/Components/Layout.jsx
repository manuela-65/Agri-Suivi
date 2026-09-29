import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "./Sidebar";
import Header from "./Header";
import FloatingAIAssistant from "./FloatingAIAssistant";

import "../Styles/Layout.css";

function Layout() {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const location = useLocation();

    return (

        <div className="app-layout">

            {/* ===========================
                    SIDEBAR
            ============================ */}

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* ===========================
                  CONTENU PRINCIPAL
            ============================ */}

            <div className="main-wrapper">

                {/* HEADER */}

                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                />

                {/* CONTENU */}

                <main className="page-wrapper">

                    <AnimatePresence mode="wait">

                        <motion.div

                            key={location.pathname}

                            className="page-content"

                            initial={{
                                opacity: 0,
                                y: 18
                            }}

                            animate={{
                                opacity: 1,
                                y: 0
                            }}

                            exit={{
                                opacity: 0,
                                y: -18
                            }}

                            transition={{
                                duration: 0.35,
                                ease: "easeOut"
                            }}

                        >

                            <Outlet />

                        </motion.div>

                    </AnimatePresence>

                </main>

                {/* ASSISTANT IA FLOTTANT (Accessible de partout) */}
                <FloatingAIAssistant />

            </div>

        </div>

    );

}

export default Layout;