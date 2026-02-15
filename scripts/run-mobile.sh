#!/bin/bash
# MakerCycle - Script para ejecutar la app en emulador/simulador
set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "  __  __       _             ____           _      "
echo " |  \/  | __ _| | _____ _ _/ ___|_   _  ___| | ___ "
echo " | |\/| |/ _\` | |/ / _ \ '__| |  | | | |/ __| |/ _ \\"
echo " | |  | | (_| |   <  __/ |  | |__| |_| | (__| |  __/"
echo " |_|  |_|\__,_|_|\_\___|_|   \____\__, |\___|_|\___|"
echo "                                   |___/             "
echo -e "${NC}"
echo -e "${BLUE}Mobile Development Runner${NC}"
echo ""

# Verificar dependencias
check_deps() {
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}Error: pnpm no encontrado. Instala con: npm install -g pnpm${NC}"
        exit 1
    fi
    if ! command -v npx &> /dev/null; then
        echo -e "${RED}Error: npx no encontrado. Instala Node.js${NC}"
        exit 1
    fi
}

check_deps

# Menu
echo -e "${YELLOW}Selecciona una opcion:${NC}"
echo ""
echo -e "  ${GREEN}1)${NC} Android Emulador  ${BLUE}(build + sync + run)${NC}"
echo -e "  ${GREEN}2)${NC} iOS Simulador     ${BLUE}(build + sync + run)${NC}"
echo -e "  ${GREEN}3)${NC} Android Live Reload ${BLUE}(dev server + hot reload)${NC}"
echo -e "  ${GREEN}4)${NC} iOS Live Reload    ${BLUE}(dev server + hot reload)${NC}"
echo -e "  ${GREEN}5)${NC} Solo Build + Sync  ${BLUE}(sin ejecutar)${NC}"
echo -e "  ${GREEN}6)${NC} Abrir Android Studio"
echo -e "  ${GREEN}7)${NC} Abrir Xcode"
echo ""
read -p "Opcion [1-7]: " choice

case $choice in
    1)
        echo -e "\n${CYAN}>>> Compilando MakerCycle...${NC}"
        pnpm build
        echo -e "${CYAN}>>> Sincronizando con Capacitor (Android)...${NC}"
        npx cap sync android
        echo -e "${CYAN}>>> Lanzando en Android emulador...${NC}"
        npx cap run android
        ;;
    2)
        echo -e "\n${CYAN}>>> Compilando MakerCycle...${NC}"
        pnpm build
        echo -e "${CYAN}>>> Sincronizando con Capacitor (iOS)...${NC}"
        npx cap sync ios
        echo -e "${CYAN}>>> Lanzando en iOS simulador...${NC}"
        npx cap run ios
        ;;
    3)
        echo -e "\n${CYAN}>>> Lanzando Android con Live Reload...${NC}"
        echo -e "${YELLOW}Nota: Asegurate de que el servidor dev esta corriendo (pnpm dev)${NC}"
        npx cap run android --livereload --external
        ;;
    4)
        echo -e "\n${CYAN}>>> Lanzando iOS con Live Reload...${NC}"
        echo -e "${YELLOW}Nota: Asegurate de que el servidor dev esta corriendo (pnpm dev)${NC}"
        npx cap run ios --livereload --external
        ;;
    5)
        echo -e "\n${CYAN}>>> Compilando MakerCycle...${NC}"
        pnpm build
        echo -e "${CYAN}>>> Sincronizando con Capacitor (Android)...${NC}"
        npx cap sync android
        echo -e "${GREEN}>>> Build + Sync completado!${NC}"
        ;;
    6)
        echo -e "\n${CYAN}>>> Abriendo Android Studio...${NC}"
        npx cap open android
        ;;
    7)
        echo -e "\n${CYAN}>>> Abriendo Xcode...${NC}"
        npx cap open ios
        ;;
    *)
        echo -e "${RED}Opcion no valida${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}Done!${NC}"
