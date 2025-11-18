import React, { useState } from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface Props {
  label: string;
  placeholder: string;
  secure?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  labelColor?: string;
}

export default function InputField({
  label,
  placeholder,
  secure = false,
  value,
  onChangeText,
  labelColor,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <View className="w-full mb-4">
      <Text
        className="mb-1 font-opensans-bold"
        style={{ color: labelColor || "white" }}
      >
        {label}
      </Text>

      <View className="flex-row items-center px-4 py-3 bg-gray-800/60 rounded-xl">
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#c4c4c4"
          secureTextEntry={secure && !show}
          value={value}
          onChangeText={onChangeText}
          className="flex-1 text-white font-opensans-regular"
        />

        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)}>
            {show ? (
              <Eye size={22} color="#fff" />
            ) : (
              <EyeOff size={22} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
