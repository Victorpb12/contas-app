import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { storageService } from "../storage";
import { Conta, RootStackParamList } from "../types";
import { formatarMoeda } from "../utils";

type DetalhesContaScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "DetalhesConta">;
  route: RouteProp<RootStackParamList, "DetalhesConta">;
};

export const DetalhesContaScreen: React.FC<DetalhesContaScreenProps> = ({
  navigation,
  route,
}) => {
  const [conta, setConta] = useState<Conta>(route.params.conta);

  const calcularValorPago = (): number => {
    const temParcelas = conta.temParcelas;
    if (!temParcelas) {
      return conta.valorPago;
    }
    return conta.parcelas?.reduce((total, parcela) => {
      return parcela.paga ? total + parcela.valor : total;
    }, 0);
  };

  const toggleParcela = async (numeroParcela: number) => {
    const parcelasAtualizadas = conta.parcelas.map((p) => {
      if (p.numero === numeroParcela) {
        return {
          ...p,
          paga: !p.paga,
          dataPagamento: !p.paga ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });

    const contaAtualizada: Conta = {
      ...conta,
      parcelas: parcelasAtualizadas,
      valorPago: parcelasAtualizadas.reduce(
        (total, p) => (p.paga ? total + p.valor : total),
        0
      ),
    };

    await storageService.updateConta(contaAtualizada);
    setConta(contaAtualizada);
  };

  const confirmarPagamento = (numeroParcela: number, estaPaga: boolean) => {
    const acao = estaPaga ? "desmarcar" : "marcar";
    Alert.alert(
      "Confirmar Pagamento",
      `Deseja ${acao} a parcela ${numeroParcela} como paga?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => toggleParcela(numeroParcela) },
      ]
    );
  };

  const parcelasPagas = conta.parcelas?.filter((p) => p.paga).length;
  const percentualPago = (parcelasPagas / conta.quantidadeParcelas) * 100;

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-blue-600 pt-12 pb-6 px-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mb-2">
          {conta.titulo}
        </Text>
        {conta.descricao && (
          <Text className="text-blue-100 text-sm">{conta.descricao}</Text>
        )}

        <View className="flex-row justify-between mt-4">
          <View>
            <Text className="text-blue-200 text-sm">Valor Total</Text>
            <Text className="text-white text-xl font-semibold">
              {formatarMoeda(conta.valorTotal)}
            </Text>
          </View>
          <View>
            <Text className="text-blue-200 text-sm">Valor Pago</Text>
            <Text className="text-white text-xl font-semibold">
              {formatarMoeda(calcularValorPago())}
            </Text>
          </View>
        </View>

        {conta.temParcelas && (
          <View className="mt-4 bg-blue-500 rounded-lg p-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-white font-semibold">
                Progresso: {parcelasPagas}/{conta.quantidadeParcelas} parcelas
              </Text>
              <Text className="text-white font-semibold">
                {percentualPago.toFixed(0)}%
              </Text>
            </View>
            <View className="bg-blue-300 rounded-full h-2 overflow-hidden">
              <View
                className="bg-green-400 h-full"
                style={{ width: `${percentualPago}%` }}
              />
            </View>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 p-4">
        {conta.temParcelas ? (
          <View>
            <Text className="text-gray-700 font-bold text-lg mb-3">
              Parcelas ({conta.quantidadeParcelas}x de{" "}
              {formatarMoeda(conta.valorParcela)})
            </Text>

            {conta.parcelas.map((parcela) => (
              <TouchableOpacity
                key={parcela.numero}
                className={`bg-white rounded-lg p-4 mb-3 flex-row items-center justify-between ${
                  parcela.paga ? "border-2 border-green-500" : ""
                }`}
                onPress={() => confirmarPagamento(parcela.numero, parcela.paga)}
              >
                <View className="flex-1">
                  <Text
                    className={`font-semibold text-base ${
                      parcela.paga ? "text-green-600" : "text-gray-800"
                    }`}
                  >
                    Parcela {parcela.numero}/{conta.quantidadeParcelas}
                  </Text>
                  <Text
                    className={`text-lg font-bold ${
                      parcela.paga ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {formatarMoeda(parcela.valor)}
                  </Text>
                  {parcela.paga && parcela.dataPagamento && (
                    <Text className="text-green-600 text-xs mt-1">
                      Pago em{" "}
                      {new Date(parcela.dataPagamento).toLocaleDateString(
                        "pt-BR"
                      )}
                    </Text>
                  )}
                </View>

                <View
                  className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                    parcela.paga
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {parcela.paga && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-lg p-4">
            <Text className="text-gray-700 font-semibold text-base mb-2">
              Pagamento Único
            </Text>
            <Text className="text-gray-900 text-2xl font-bold">
              {formatarMoeda(conta.valorTotal)}
            </Text>
            <TouchableOpacity
              className={`mt-4 p-4 rounded-lg ${
                conta.valorPago >= conta.valorTotal
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
              onPress={() => {
                const novaConta = {
                  ...conta,
                  valorPago:
                    conta.valorPago >= conta.valorTotal ? 0 : conta.valorTotal,
                };
                storageService.updateConta(novaConta);
                setConta(novaConta);
              }}
            >
              <Text className="text-white font-bold text-center">
                {conta.valorPago >= conta.valorTotal
                  ? "Desmarcar como Pago"
                  : "Marcar como Pago"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
