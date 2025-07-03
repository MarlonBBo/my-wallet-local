import { useSQLiteContext } from "expo-sqlite";

export type AnotacaoItem = {
    id?: number;
    anotacao_id?: number;
    conteudo: string;
    valor: number;
};

export type Anotacao = {
    id: number;
    mes: string;
    itens?: AnotacaoItem[];
};

export function useAnnotationDatabase() {
    const db = useSQLiteContext();

    async function salvarAnotacao(mes: string, dados: Omit<AnotacaoItem, 'id' | 'anotacao_id'>[]) {
        try {
            const result = await db.runAsync(`INSERT INTO anotacoes (mes) VALUES (?);`, [mes]);
            const anotacaoId = result.lastInsertRowId;

            for (const item of dados) {
                await db.runAsync(
                    `INSERT INTO anotacao_itens (anotacao_id, conteudo, valor) VALUES (?, ?, ?);`,
                    [anotacaoId, item.conteudo, item.valor]
                );
            }
            console.log("Anotação salva com sucesso! ID:", anotacaoId);
            return anotacaoId;
        } catch (err) {
            console.error("Erro ao salvar anotação:", err);
            throw err;
        }
    }

    async function listarAnotacoes() {
        const anotacoes: Anotacao[] = await db.getAllAsync(`SELECT * FROM anotacoes;`);

        for (const anotacao of anotacoes) {
            const itens: AnotacaoItem[] = await db.getAllAsync(
                `SELECT * FROM anotacao_itens WHERE anotacao_id = ?;`,
                [anotacao.id]
            );
            anotacao.itens = itens;
        }

        return anotacoes;
    }

    async function atualizarAnotacaoCompleta(
        id: number,
        novoMes: string,
        novosItens: Omit<AnotacaoItem, 'id' | 'anotacao_id'>[]
        ) {
        try {
            await db.runAsync(`UPDATE anotacoes SET mes = ? WHERE id = ?;`, [novoMes, id]);

            await db.runAsync(`DELETE FROM anotacao_itens WHERE anotacao_id = ?;`, [id]);

            for (const item of novosItens) {
            await db.runAsync(
                `INSERT INTO anotacao_itens (anotacao_id, conteudo, valor) VALUES (?, ?, ?);`,
                [id, item.conteudo, item.valor]
            );
            }

            console.log(`Anotação ${id} atualizada com sucesso!`);
        } catch (err) {
            console.error(`Erro ao atualizar anotação ${id}:`, err);
            throw err;
        }
    }


    async function deletarAnotacao(id: number) {
        await db.runAsync(`DELETE FROM anotacao_itens WHERE anotacao_id = ?;`, [id]);
        await db.runAsync(`DELETE FROM anotacoes WHERE id = ?;`, [id]);
        console.log("Anotação e seus itens deletados com sucesso!");
    }

    async function deletarItem(id: number) {
        await db.runAsync(`DELETE FROM anotacao_itens WHERE id = ?;`, [id]);
    }

    return {
        salvarAnotacao,
        listarAnotacoes,
        atualizarAnotacaoCompleta,
        deletarAnotacao,
        deletarItem,
    };
}

