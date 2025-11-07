import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authService } from "../services/authService";

type RootStackParamList = {
  ForgotPassword: undefined;
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const emailIsValid = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleReset = async () => {
    setInfoMsg(null);

    if (!emailIsValid(email)) {
      setInfoMsg("Email inválido — corrige aí.");
      return;
    }

    setLoading(true);
    try {
      const res = (await authService.resetPassword?.(email.trim())) ?? {
        ok: false,
        error: "resetPassword não implementado no authService",
      };

      if (res.ok) {
        Alert.alert(
          "Email enviado",
          "Se essa conta existir, você receberá um email com instruções para redefinir a senha.",
          [{ text: "Ok", onPress: () => navigation.replace("Login") }]
        );
      } else {
        setInfoMsg(res.error || "Erro ao solicitar redefinição.");
      }
    } catch (err: any) {
      setInfoMsg(err?.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, paddingTop: insets.top }}
    >
      <View className="flex-1 bg-gray-50 px-6 pt-12">
        <View className="items-center mb-6">
          <View className="bg-yellow-500 rounded-full p-4 mb-4 shadow">
            <Ionicons name="mail-open-outline" size={36} color="#fff" />
          </View>
          <Text className="text-2xl font-bold text-gray-800">
            Esqueci a senha
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Vamos te mandar um link pra resetar.
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-sm text-gray-600 font-semibold mb-2">
            Email
          </Text>
          <TextInput
            placeholder="seu@exemplo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-gray-100 rounded-lg px-3 py-3 mb-3"
            accessibilityLabel="campo email para recuperação"
          />

          {infoMsg ? (
            <Text className="text-sm text-gray-600 mb-3">{infoMsg}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            className={`py-3 rounded-lg items-center ${
              loading ? "bg-yellow-300" : "bg-yellow-500"
            }`}
            accessibilityLabel="Botão solicitar reset de senha"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Enviar instruções
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-4">
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text className="text-blue-600 font-semibold">
                Voltar ao login
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-6 items-center">
          <Text className="text-xs text-gray-400 text-center px-6">
            Você receberá um email com o link para redefinir a senha. Quando
            integrar com Supabase, o fluxo ficará automático.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
