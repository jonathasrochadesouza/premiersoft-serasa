# Estrategia de estabilizacao

O objetivo e transformar leituras instaveis enviadas a cada 100ms em uma unica pesagem consolidada.

## Agrupamento

As leituras sao agrupadas por balanca e placa:

```text
scaleId + plate
```

Isso permite receber leituras simultaneas de varias balancas e de caminhoes diferentes sem misturar janelas.

## Janela movel

Cada grupo mantem em memoria apenas as leituras recentes dentro de `STABILIZATION_WINDOW_MS`, cujo valor padrao e `3000`.

Uma janela so pode estabilizar quando:

- possui pelo menos `STABILIZATION_MIN_READINGS`, padrao `20`;
- representa ao menos 80% da janela configurada, para aproximar os 3 segundos exigidos;
- a diferenca entre o maior e o menor peso e menor ou igual a `STABILIZATION_TOLERANCE_KG`, padrao `30`;
- o peso final e calculado por media aparada, removendo 10% dos menores e 10% dos maiores valores.

## Presenca processada

Depois que uma janela estabiliza, o grupo `scaleId + plate` e marcado como processado. Novas leituras da mesma presenca retornam `already_processed` e nao criam outra pesagem.

Se a balanca parar de enviar leituras por mais de `PRESENCE_EXPIRATION_MS`, padrao `10000`, a presenca expira. Uma nova sequencia da mesma placa na mesma balanca podera gerar uma nova pesagem.

## Persistencia

Ao estabilizar, o servico busca:

- balanca autorizada;
- caminhao pela placa;
- transacao de transporte ativa do caminhao;
- tipo de grao da transacao.

Entao calcula:

```text
peso_liquido = peso_bruto_estabilizado - tara
custo = (peso_liquido_kg / 1000) * preco_compra_por_tonelada
```

O preco de venda aplica margem entre 5% e 20%. A margem e inversamente proporcional ao estoque na doca: estoque baixo aproxima a margem de 20%; estoque abundante aproxima a margem de 5%.
