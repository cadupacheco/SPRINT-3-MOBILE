import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, RadioButton, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMotorcycles } from '../context/MotorcycleContext';

type AddMotorcycleNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMotorcycle'>;

export default function AddMotorcycleScreen() {
    const navigation = useNavigation<AddMotorcycleNavigationProp>();
    const { actions } = useMotorcycles();
    
    // Estados para os campos do formulário - ATUALIZADO para incluir 'out_of_service'
    const [model, setModel] = useState('');
    const [plate, setPlate] = useState('');
    const [status, setStatus] = useState<'available' | 'maintenance' | 'rented' | 'out_of_service'>('available');
    const [locationX, setLocationX] = useState('');
    const [locationY, setLocationY] = useState('');
    
    // Estados para validação
    const [errors, setErrors] = useState({
        model: '',
        plate: '',
        locationX: '',
        locationY: '',
    });

    // Função para validar o formulário
    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            model: '',
            plate: '',
            locationX: '',
            locationY: '',
        };

        if (!model.trim()) {
            newErrors.model = 'Modelo é obrigatório';
            isValid = false;
        }

        if (!plate.trim()) {
            newErrors.plate = 'Placa é obrigatória';
            isValid = false;
        } else if (!/^[A-Z]{3}\d{4}$/.test(plate)) {
            newErrors.plate = 'Formato de placa inválido (AAA0000)';
            isValid = false;
        }

        if (!locationX.trim()) {
            newErrors.locationX = 'Coordenada X é obrigatória';
            isValid = false;
        } else if (isNaN(Number(locationX))) {
            newErrors.locationX = 'Coordenada X deve ser um número';
            isValid = false;
        }

        if (!locationY.trim()) {
            newErrors.locationY = 'Coordenada Y é obrigatória';
            isValid = false;
        } else if (isNaN(Number(locationY))) {
            newErrors.locationY = 'Coordenada Y deve ser um número';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Função para salvar a moto
    const handleSaveMotorcycle = async () => {
        if (!validateForm()) {
            return;
        }

        const newMotorcycle = {
            model,
            plate,
            status,
            location: {
                x: Number(locationX),
                y: Number(locationY),
            },
            batteryLevel: Math.floor(Math.random() * 100),
            fuelLevel: Math.floor(Math.random() * 100),
            mileage: Math.floor(Math.random() * 50000),
            nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            assignedBranch: 'São Paulo Centro',
            lastUpdate: new Date().toISOString(),
        };

        const success = await actions.addMotorcycle(newMotorcycle);
        
        if (success) {
            Alert.alert(
                'Sucesso',
                'Moto adicionada com sucesso!',
                [
                    { 
                        text: 'OK', 
                        onPress: () => navigation.navigate('Home')
                    }
                ]
            );
        } else {
            Alert.alert('Erro', 'Não foi possível salvar a moto.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Adicionar Nova Moto - IdeaTec</Text>
            
            <TextInput
                label="Modelo"
                value={model}
                onChangeText={setModel}
                mode="outlined"
                style={styles.input}
                error={!!errors.model}
                autoComplete="off"
            />
            {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}
            
            <TextInput
                label="Placa (AAA0000)"
                value={plate}
                onChangeText={(text) => setPlate(text.toUpperCase())}
                mode="outlined"
                style={styles.input}
                error={!!errors.plate}
                autoCapitalize="characters"
                maxLength={7}
                autoComplete="off"
            />
            {errors.plate ? <Text style={styles.errorText}>{errors.plate}</Text> : null}
            
            <Text style={styles.sectionTitle}>Status</Text>
            <RadioButton.Group 
                onValueChange={(value) => setStatus(value as 'available' | 'maintenance' | 'rented' | 'out_of_service')} 
                value={status}
            >
                <View style={styles.radioContainer}>
                    <RadioButton.Item label="Disponível" value="available" />
                    <RadioButton.Item label="Em Manutenção" value="maintenance" />
                    <RadioButton.Item label="Alugada" value="rented" />
                    <RadioButton.Item label="Fora de Serviço" value="out_of_service" />
                </View>
            </RadioButton.Group>
            
            <Text style={styles.sectionTitle}>Localização no Pátio</Text>
            <View style={styles.locationContainer}>
                <View style={styles.locationInput}>
                    <TextInput
                        label="Coordenada X"
                        value={locationX}
                        onChangeText={setLocationX}
                        mode="outlined"
                        keyboardType="numeric"
                        error={!!errors.locationX}
                        autoComplete="off"
                    />
                    {errors.locationX ? <Text style={styles.errorText}>{errors.locationX}</Text> : null}
                </View>
                
                <View style={styles.locationInput}>
                    <TextInput
                        label="Coordenada Y"
                        value={locationY}
                        onChangeText={setLocationY}
                        mode="outlined"
                        keyboardType="numeric"
                        error={!!errors.locationY}
                        autoComplete="off"
                    />
                    {errors.locationY ? <Text style={styles.errorText}>{errors.locationY}</Text> : null}
                </View>
            </View>
            
            <View style={styles.buttonContainer}>
                <Button 
                    mode="outlined" 
                    onPress={() => navigation.goBack()} 
                    style={styles.button}
                    icon="close"
                >
                    Cancelar
                </Button>
                
                <Button 
                    mode="contained" 
                    onPress={handleSaveMotorcycle} 
                    style={styles.button}
                    icon="content-save"
                >
                    Salvar
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        marginBottom: 8,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    radioContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    locationInput: {
        flex: 1,
        marginHorizontal: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 24,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    },
});
