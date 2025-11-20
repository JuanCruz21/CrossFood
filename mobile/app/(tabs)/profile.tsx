import { ScrollView, View } from "react-native";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileOption from "@/components/Profile/ProfileOption";
import ProfileSection from "@/components/Profile/ProfileSection";
import LogoutButton from "@/components/Profile/LogoutButton";

import {
  MapPin,
  Wallet,
  History,
  Settings,
  HelpCircle,
  Lock,
} from "lucide-react-native";

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 px-5 py-6 bg-gray-50">
      {/* Header */}
      <ProfileHeader />

      {/* Sección: Tu Actividad */}
      <ProfileSection title="Mi cuenta">
        <ProfileOption
          label="Mis pedidos"
          icon={<History size={22} color="#ff7a00" />}
          onPress={() => {}}
        />
        <ProfileOption
          label="Direcciones"
          icon={<MapPin size={22} color="#ff7a00" />}
          onPress={() => {}}
        />
        <ProfileOption
          label="Métodos de pago"
          icon={<Wallet size={22} color="#ff7a00" />}
          onPress={() => {}}
        />
      </ProfileSection>

      {/* Sección General */}
      <ProfileSection title="Preferencias">
        <ProfileOption
          label="Configuración"
          icon={<Settings size={22} color="#ff7a00" />}
          onPress={() => {}}
        />
        <ProfileOption
          label="Centro de ayuda"
          icon={<HelpCircle size={22} color="#ff7a00" />}
          onPress={() => {}}
        />
        <ProfileOption
          label="Privacidad y seguridad"
          icon={<Lock size={22} color="#ff7a00" />}
          onPress={() => {}}
        />
      </ProfileSection>

      {/* Botón de cerrar sesión */}
      <LogoutButton onPress={() => console.log("logout")} />
    </ScrollView>
  );
}
