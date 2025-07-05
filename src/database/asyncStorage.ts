import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // Usado aqui para feedback de erro simples

// Chave única para armazenar nossos clientes no AsyncStorage
const CLIENTES_STORAGE_KEY = '@appMecanico:clientes';

// Interface para definir a estrutura de um cliente
export interface Cliente {
  id: string; // Usaremos um ID string único (UUID) para simplicidade
  nome: string;
  telefone: string;
  endereco: string;
}

/**
 * Carrega todos os clientes do AsyncStorage.
 * @returns Uma Promise que resolve com um array de clientes ou um array vazio se não houver clientes.
 */
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CLIENTES_STORAGE_KEY);
    // Se houver dados, parseia o JSON de volta para um array de objetos Cliente.
    // Caso contrário, retorna um array vazio.
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    // Erro ao ler os dados
    console.error('Erro ao ler clientes do AsyncStorage:', e);
    Alert.alert('Erro de Leitura', 'Não foi possível carregar os clientes.');
    return []; // Retorna array vazio em caso de erro
  }
};

/**
 * Salva um array de clientes no AsyncStorage.
 * Esta é uma função auxiliar interna.
 * @param clientes O array de clientes a ser salvo.
 */
const saveClientes = async (clientes: Cliente[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(clientes);
    await AsyncStorage.setItem(CLIENTES_STORAGE_KEY, jsonValue);
  } catch (e) {
    // Erro ao salvar os dados
    console.error('Erro ao salvar clientes no AsyncStorage:', e);
    Alert.alert('Erro de Escrita', 'Não foi possível salvar os clientes.');
  }
};

/**
 * Adiciona um novo cliente ao armazenamento.
 * @param nome Nome do cliente.
 * @param telefone Telefone do cliente.
 * @param endereco Endereço do cliente.
 * @returns Uma Promise que resolve quando o cliente é adicionado.
 */
export const addCliente = async (
  nome: string,
  telefone: string,
  endereco: string
): Promise<void> => {
  try {
    const clientes = await getClientes(); // Pega a lista atual
    const newCliente: Cliente = {
      id: String(Date.now()), // ID simples baseado no timestamp para unicidade
      nome,
      telefone,
      endereco,
    };
    clientes.push(newCliente); // Adiciona o novo cliente
    await saveClientes(clientes); // Salva a lista atualizada
    console.log('Cliente adicionado:', newCliente);
  } catch (e) {
    console.error('Erro ao adicionar cliente:', e);
    Alert.alert('Erro', 'Não foi possível adicionar o cliente.');
  }
};

/**
 * Deleta um cliente pelo ID.
 * @param id O ID do cliente a ser deletado.
 * @returns Uma Promise que resolve quando o cliente é deletado.
 */
export const deleteCliente = async (id: string): Promise<void> => {
  try {
    let clientes = await getClientes(); // Pega a lista atual
    const initialLength = clientes.length;
    clientes = clientes.filter(cliente => cliente.id !== id); // Filtra o cliente a ser deletado
    if (clientes.length < initialLength) {
      await saveClientes(clientes); // Salva a lista filtrada
      console.log(`Cliente com ID ${id} deletado.`);
    } else {
      console.warn(`Cliente com ID ${id} não encontrado para deletar.`);
    }
  } catch (e) {
    console.error('Erro ao deletar cliente:', e);
    Alert.alert('Erro', 'Não foi possível deletar o cliente.');
  }
};

/**
 * Limpa todos os clientes do armazenamento (para fins de teste/desenvolvimento).
 * CUIDADO: Isso irá apagar todos os dados de clientes!
 */
export const clearAllClientes = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CLIENTES_STORAGE_KEY);
    console.log('Todos os clientes foram removidos do AsyncStorage.');
  } catch (e) {
    console.error('Erro ao limpar clientes do AsyncStorage:', e);
    Alert.alert('Erro', 'Não foi possível limpar os clientes.');
  }
};
