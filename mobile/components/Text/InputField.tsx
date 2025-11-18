import React, { useState } from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface Props {
  label: string;
  placeholder: string;
  secure?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;

  // 🎨 ESTILOS PERSONALIZABLES
  labelColor?: string;
  bgColor?: string;
  textColor?: string;
  placeholderColor?: string;
  borderColor?: string;
  iconColor?: string;
}

export default function InputField({
  label,
  placeholder,
  secure = false,
  value,
  onChangeText,

  labelColor = "#333",
  bgColor = "#F7F7F7",
  textColor = "#111",
  placeholderColor = "#888",
  borderColor = "#e2e2e2",
  iconColor = "#777",
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <View className="w-full mb-4">
      <Text
        className="mb-1 text-sm font-opensans-bold"
        style={{ color: labelColor }}
      >
        {label}
      </Text>

      <View
        className="flex-row items-center px-4 py-3 rounded-2xl"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: 1,
        }}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secure && !show}
          value={value}
          onChangeText={onChangeText}
          className="flex-1 font-opensans-regular"
          style={{ color: textColor }}
        />

        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)}>
            {show ? (
              <Eye size={22} color={iconColor} />
            ) : (
              <EyeOff size={22} color={iconColor} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
