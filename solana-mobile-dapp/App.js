import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

export default function App() {
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        (async () => {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const publicKey = new PublicKey('SuaChavePúblicaAqui');

            const balance = await connection.getBalance(publicKey);
            setBalance(balance / 1e9); // Converter lamports para SOL
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Text>
                Saldo da carteira: {balance !== null ? `${balance} SOL` : 'Carregando...'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
