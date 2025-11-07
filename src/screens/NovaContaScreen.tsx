import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { storageService } from "../storage";
import { Conta, RootStackParamList } from "../types";
import { formatarMoeda, formatCurrency, parseCurrency } from "../utils";

type NovaContaScreenProps = {
  navigation: BottomTabNavigationProp<RootStackParamList, "NovaConta">;
  route: RouteProp<RootStackParamList, "NovaConta">;
};

export const NovaContaScreen: React.FC<NovaContaScreenProps> = ({
  navigation,
  route,
}) => {
  const contaParaEditar = route.params?.conta;
  const ehEdicao = !!contaParaEditar;

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [temParcelas, setTemParcelas] = useState(false);
  const [quantidadeParcelas, setQuantidadeParcelas] = useState("1");

  useFocusEffect(
    React.useCallback(() => {
      const contaAtual = route.params?.conta;

      if (contaAtual) {
        setTitulo(contaAtual.titulo);
        setDescricao(contaAtual.descricao);
        setValorTotal(formatCurrency(contaAtual.valorTotal));
        setValorPago(formatCurrency(contaAtual.valorPago));
        setTemParcelas(contaAtual.temParcelas);
        setQuantidadeParcelas(contaAtual.quantidadeParcelas.toString());
      } else {
        setTitulo("");
        setDescricao("");
        setValorTotal("");
        setValorPago("");
        setTemParcelas(false);
        setQuantidadeParcelas("1");
      }

      return () => {
        navigation.setParams({ conta: undefined } as any);
      };
    }, [route.params?.conta, navigation])
  );

  const calcularValorParcela = (): number => {
    const total = parseFloat(valorTotal) || 0;
    const parcelas = parseInt(quantidadeParcelas) || 1;
    return total / parcelas;
  };

  const validarCampos = (): boolean => {
    if (!titulo.trim()) {
      Alert.alert("Erro", "Por favor, preencha o título da conta.");
      return false;
    }
    if (!valorTotal || parseFloat(valorTotal) <= 0) {
      Alert.alert("Erro", "Por favor, informe um valor total válido.");
      return false;
    }
    if (
      temParcelas &&
      (!quantidadeParcelas || parseInt(quantidadeParcelas) <= 0)
    ) {
      Alert.alert(
        "Erro",
        "Por favor, informe uma quantidade de parcelas válida."
      );
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validarCampos()) return;

    const valorTotalNum = parseCurrency(valorTotal);
    const valorPagoNum = parseCurrency(valorPago);
    const quantidadeParcelasNum = temParcelas
      ? parseInt(quantidadeParcelas)
      : 1;
    const valorParcelaNum = valorTotalNum / quantidadeParcelasNum;

    const parcelas = Array.from(
      {
        length: quantidadeParcelasNum,
      },
      (_, index) => ({
        numero: index + 1,
        valor: valorParcelaNum,
        paga: false,
        dataPagamento: undefined,
        dataVencimento: undefined,
      })
    );

    const parcelasFinais = contaParaEditar?.parcelas
      ? contaParaEditar.parcelas.map((p, idx) => ({
          ...p,
          valor: valorParcelaNum,
          numero: idx + 1,
        }))
      : parcelas;

    const conta: Conta = {
      id: contaParaEditar?.id || Date.now().toString(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      valorTotal: valorTotalNum,
      valorPago: contaParaEditar?.valorPago ? valorPagoNum : valorPagoNum,
      temParcelas,
      quantidadeParcelas: quantidadeParcelasNum,
      valorParcela: valorParcelaNum,
      parcelas: parcelasFinais,
      dataCriacao: contaParaEditar?.dataCriacao || new Date().toISOString(),
    };

    if (ehEdicao) {
      await storageService.updateConta(conta);
    } else {
      await storageService.addConta(conta);
    }

    setTitulo("");
    setDescricao("");
    setValorTotal("");
    setValorPago("");
    setTemParcelas(false);
    setQuantidadeParcelas("1");

    navigation.navigate("ContasTab" as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-100"
    >
      <ScrollView className="flex-1">
        <View className="bg-blue-600 pt-12 pb-6 px-4">
          <Text className="text-white text-2xl font-bold text-center">
            {ehEdicao ? "Editar Conta" : "Nova Conta"}
          </Text>
        </View>

        <View className="p-4">
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-2">
              Título <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="Ex: Conta de luz"
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Descrição</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="Detalhes sobre a conta..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
            />
          </View>

          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-2">
              Valor Total <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="0"
              value={valorTotal}
              onChangeText={setValorTotal}
              keyboardType="numeric"
              onFocus={() => {
                const num = parseCurrency(valorTotal);
                setValorTotal(num ? num.toString() : "");
              }}
              onBlur={() => {
                const num = parseCurrency(valorTotal);
                setValorTotal(num ? formatCurrency(num) : "");
              }}
            />
          </View>

          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Valor Pago</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="0"
              value={valorPago}
              onChangeText={setValorPago}
              keyboardType="numeric"
              onFocus={() => {
                const num = parseCurrency(valorPago);
                setValorPago(num ? num.toString() : "");
              }}
              onBlur={() => {
                const num = parseCurrency(valorPago);
                setValorPago(num ? formatCurrency(num) : "");
              }}
            />
          </View>

          <View className="bg-white rounded-lg p-4 mb-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700 font-semibold">Tem parcelas?</Text>
              <Switch
                value={temParcelas}
                onValueChange={setTemParcelas}
                trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                thumbColor={temParcelas ? "#1d4ed8" : "#f3f4f6"}
              />
            </View>
          </View>

          {temParcelas && (
            <>
              <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Quantidade de Parcelas <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="bg-gray-100 p-3 rounded-lg"
                  placeholder="1"
                  value={quantidadeParcelas}
                  onChangeText={setQuantidadeParcelas}
                  keyboardType="numeric"
                />
              </View>

              <View className="bg-blue-50 rounded-lg p-4 mb-4">
                <Text className="text-blue-800 font-semibold text-center">
                  Valor de cada parcela
                </Text>
                <Text className="text-blue-600 text-lg text-center mt-1">
                  {quantidadeParcelas}x de{" "}
                  {formatarMoeda(calcularValorParcela())}
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-lg items-center"
            onPress={handleSalvar}
          >
            <Text className="text-white font-bold text-lg">Salvar Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
