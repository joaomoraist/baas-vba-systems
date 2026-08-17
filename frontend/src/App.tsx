import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem('baasLoggedIn') === 'true'
  );

  if (!loggedIn) {
    return (
      <Login
        onLogin={() => {
          setLoggedIn(true);
        }}
      />
    );
  }

  return (
    <Dashboard
      onLogout={() => {
        localStorage.removeItem('gatewayAccountId');
        localStorage.removeItem('baasLoggedIn');
        setLoggedIn(false);
      }}
    />
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://localhost:3000/gateway/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Erro ao realizar login.'
        );
      }

      localStorage.setItem(
      'gatewayAccountId',
      data.gatewayAccountId
    );

    localStorage.setItem(
      'baasLoggedIn',
      'true'
    );

    onLogin();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao realizar login.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>BaaS</h1>
        <p>Entre na sua conta</p>

        <form onSubmit={handleLogin}>
          <label>Documento</label>

          <input
            type="text"
            placeholder="CPF ou CNPJ"
            value={document}
            onChange={(e) =>
              setDocument(e.target.value)
            }
          />

          <label>Senha</label>

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const gatewayAccountId =
    localStorage.getItem('gatewayAccountId');

  const [balance, setBalance] = useState('R$ 0,00');
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] =
    useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [page, setPage] = useState('dashboard');

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [payerDocument, setPayerDocument] = useState('');
  const [method, setMethod] = useState('');
  const [loadingCheckout, setLoadingCheckout] =
    useState(false);
  const [checkoutResult, setCheckoutResult] =
    useState<any>(null);
  const [checkoutError, setCheckoutError] = useState('');

  const [brand, setBrand] = useState('');
  const [installments, setInstallments] =
    useState<number | ''>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  const [withdrawalAmount, setWithdrawalAmount] =
    useState('');
  const [pixKey, setPixKey] = useState('');
  const [withdrawalDocument, setWithdrawalDocument] =
    useState('');
  const [withdrawalDescription, setWithdrawalDescription] =
    useState('');
  const [
    withdrawalExternalReference,
    setWithdrawalExternalReference,
  ] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] =
    useState(false);
  const [withdrawalError, setWithdrawalError] =
    useState('');
  const [withdrawalResult, setWithdrawalResult] =
    useState<any>(null);
  const [withdrawalStatusLoading, setWithdrawalStatusLoading] =
    useState(false);
  const [withdrawalStatusResult, setWithdrawalStatusResult] =
    useState<any>(null);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [webhookLoading, setWebhookLoading] =
    useState(false);
  const [webhookError, setWebhookError] = useState('');
  const [webhookResult, setWebhookResult] =
    useState<any>(null);

  useEffect(() => {
    async function loadWallet() {
      try {
        const response = await fetch(
          `http://localhost:3000/wallet?gatewayAccountId=${gatewayAccountId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Erro ao buscar saldo.'
          );
        }

        setBalance(data.balanceFormatted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    async function loadTransactions() {
      setTransactionsLoading(true);

      try {
        const params = new URLSearchParams();

        if (statusFilter) {
          params.append('status', statusFilter);
        }

        if (typeFilter) {
          params.append('type', typeFilter);
        }

        const url =
          `http://localhost:3000/wallet/transactions/${gatewayAccountId}` +
          (params.toString()
            ? `?${params.toString()}`
            : '');

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Erro ao buscar transações.'
          );
        }

        setTransactions(data.transactions || []);
      } catch (error) {
        console.error(error);
      } finally {
        setTransactionsLoading(false);
      }
    }

    loadWallet();
    loadTransactions();
  }, [
    gatewayAccountId,
    statusFilter,
    typeFilter,
  ]);

  async function handleCreateCheckout(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoadingCheckout(true);
    setCheckoutError('');
    setCheckoutResult(null);

    try {
      if (!gatewayAccountId) {
        throw new Error(
          'Conta do Gateway não encontrada.'
        );
      }

      const amountInCents = Math.round(
        Number(amount) * 100
      );

      if (amountInCents <= 0) {
        throw new Error(
          'Informe um valor válido.'
        );
      }

      const body = {
        amount: amountInCents,
        method,
        description,
        payerDocument,
        externalReference: `PEDIDO-${Date.now()}`,
        gatewayAccountId,

        ...(method === 'CARD' && {
          brand,
          installments: Number(installments),
          cardNumber,
          cardHolder,
          expiryMonth,
          expiryYear,
          cvv,
        }),
      };

      const response = await fetch(
        'http://localhost:3000/checkout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Erro ao criar checkout.'
        );
      }

      setCheckoutResult(data);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'Erro ao criar checkout.'
      );
    } finally {
      setLoadingCheckout(false);
    }
  }

  async function handleWithdrawal(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setWithdrawalLoading(true);
    setWithdrawalError('');
    setWithdrawalResult(null);
    setWithdrawalStatusResult(null);

    try {
      if (!gatewayAccountId) {
        throw new Error(
          'Conta do Gateway não encontrada.'
        );
      }

      const amountInCents = Math.round(
        Number(withdrawalAmount) * 100
      );

      if (amountInCents <= 0) {
        throw new Error(
          'Informe um valor válido.'
        );
      }

      const response = await fetch(
        'http://localhost:3000/withdrawals',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gatewayAccountId,
            amount: amountInCents,
            pixKey,
            document: withdrawalDocument,
            description:
              withdrawalDescription || undefined,
            externalReference:
              withdrawalExternalReference ||
              undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Erro ao solicitar saque.'
        );
      }

      setWithdrawalResult(
        data.withdrawal || data
      );
    } catch (error) {
      setWithdrawalError(
        error instanceof Error
          ? error.message
          : 'Erro ao solicitar saque.'
      );
    } finally {
      setWithdrawalLoading(false);
    }
  }

  async function handleWithdrawalStatus() {
    if (
      !gatewayAccountId ||
      !withdrawalResult?.id
    ) {
      return;
    }

    setWithdrawalStatusLoading(true);
    setWithdrawalError('');

    try {
      const url =
        `http://localhost:3000/withdrawals/` +
        `${gatewayAccountId}/` +
        `${withdrawalResult.id}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Erro ao consultar status do saque.'
        );
      }

      setWithdrawalStatusResult(data);
    } catch (error) {
      setWithdrawalError(
        error instanceof Error
          ? error.message
          : 'Erro ao consultar status do saque.'
      );
    } finally {
      setWithdrawalStatusLoading(false);
    }
  }

  async function handleRegisterWebhooks(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setWebhookLoading(true);
    setWebhookError('');
    setWebhookResult(null);

    try {
      if (!gatewayAccountId) {
        throw new Error(
          'Conta do Gateway não encontrada.'
        );
      }

      if (!webhookUrl) {
        throw new Error(
          'Informe a URL da API BaaS.'
        );
      }

      const response = await fetch(
        'http://localhost:3000/gateway/webhooks',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gatewayAccountId,
            url: webhookUrl,
            secret:
              webhookSecret || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Erro ao cadastrar webhooks.'
        );
      }

      setWebhookResult(data);
    } catch (error) {
      setWebhookError(
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar webhooks.'
      );
    } finally {
      setWebhookLoading(false);
    }
  }

  const sidebar = (
    <Sidebar
      page={page}
      setPage={setPage}
      onLogout={onLogout}
    />
  );

  if (page === 'checkout') {
    return (
      <div className="app">
        {sidebar}

        <main className="main">
          <header className="header">
            <div>
              <h1>Checkout</h1>
              <p>
                Crie um novo link de pagamento
              </p>
            </div>
          </header>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Novo checkout</h2>
                <p>
                  Informe os dados do pagamento
                </p>
              </div>
            </div>

            <form
              className="checkout-form"
              onSubmit={handleCreateCheckout}
            >
              <label>Valor</label>

              <input
                type="number"
                placeholder="Ex: 50.00"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                step="0.01"
                min="0.01"
              />

              <label>
                Método de pagamento
              </label>

              <select
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value)
                }
              >
                <option value="">
                  Selecione o método
                </option>
                <option value="PIX">
                  Pix
                </option>
                <option value="CARD">
                  Cartão
                </option>
              </select>

              <label>Descrição</label>

              <input
                type="text"
                placeholder="Ex: Pedido #123"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

              <label>
                Documento do pagador
              </label>

              <input
                type="text"
                placeholder="CPF ou CNPJ"
                value={payerDocument}
                onChange={(e) =>
                  setPayerDocument(
                    e.target.value
                  )
                }
              />

              {method === 'CARD' && (
                <>
                  <label>Bandeira</label>

                  <select
                    value={brand}
                    onChange={(e) =>
                      setBrand(e.target.value)
                    }
                  >
                    <option value="">
                      Selecione
                    </option>
                    <option value="VISA">
                      Visa
                    </option>
                    <option value="MASTERCARD">
                      Mastercard
                    </option>
                    <option value="ELO">
                      Elo
                    </option>
                  </select>

                  <label>Parcelas</label>

                  <select
                    value={installments}
                    onChange={(e) =>
                      setInstallments(
                        Number(e.target.value)
                      )
                    }
                  >
                    <option value="">
                      Selecione
                    </option>

                    {Array.from(
                      { length: 21 },
                      (_, index) => (
                        <option
                          key={index + 1}
                          value={index + 1}
                        >
                          {index + 1}x
                        </option>
                      )
                    )}
                  </select>

                  <label>
                    Número do cartão
                  </label>

                  <input
                    type="text"
                    placeholder="4111111111111111"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    Nome no cartão
                  </label>

                  <input
                    type="text"
                    placeholder="SEU NOME"
                    value={cardHolder}
                    onChange={(e) =>
                      setCardHolder(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    Mês de validade
                  </label>

                  <input
                    type="text"
                    placeholder="12"
                    value={expiryMonth}
                    onChange={(e) =>
                      setExpiryMonth(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    Ano de validade
                  </label>

                  <input
                    type="text"
                    placeholder="2030"
                    value={expiryYear}
                    onChange={(e) =>
                      setExpiryYear(
                        e.target.value
                      )
                    }
                  />

                  <label>CVV</label>

                  <input
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value)
                    }
                  />
                </>
              )}

              {checkoutError && (
                <div className="login-error">
                  {checkoutError}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={loadingCheckout}
              >
                {loadingCheckout
                  ? 'Criando...'
                  : 'Criar checkout'}
              </button>
            </form>

            {checkoutResult && (
              <div className="checkout-result">
                <h3>
                  Checkout criado com sucesso!
                </h3>

                <p>
                  <strong>
                    Referência:
                  </strong>{' '}
                  {
                    checkoutResult.externalReference
                  }
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  {
                    checkoutResult
                      .gatewayPaymentStatus
                  }
                </p>

                {checkoutResult.qrCodeBase64 && (
                  <div>
                    <p>
                      <strong>
                        QR Code Pix
                      </strong>
                    </p>

                    <img
                      src={`data:image/png;base64,${checkoutResult.qrCodeBase64}`}
                      alt="QR Code Pix"
                    />
                  </div>
                )}

                {checkoutResult.emv && (
                  <div>
                    <p>
                      <strong>
                        Código Pix:
                      </strong>
                    </p>

                    <textarea
                      value={checkoutResult.emv}
                      readOnly
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (page === 'transactions') {
    return (
      <div className="app">
        {sidebar}

        <main className="main">
          <header className="header">
            <div>
              <h1>Transações</h1>
              <p>
                Extrato e movimentações da carteira
              </p>
            </div>
          </header>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>
                  Todas as transações
                </h2>
                <p>
                  Filtre as movimentações da sua
                  conta
                </p>
              </div>
            </div>

            <div className="filters">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todos os status
                </option>

                <option value="APPROVED">
                  Aprovado
                </option>

                <option value="DENIED">
                  Negado
                </option>

                <option value="EXPIRED">
                  Expirado
                </option>

                <option value="CANCELLED">
                  Cancelado
                </option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todos os tipos
                </option>

                <option value="PAYMENT">
                  Pagamento
                </option>

                <option value="WITHDRAWAL">
                  Saque
                </option>
              </select>
            </div>

            <div className="transactions-list">
              {transactionsLoading ? (
                <div className="empty-state">
                  <h3>
                    Carregando transações...
                  </h3>
                </div>
              ) : transactions.length ===
                0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    ↗
                  </div>

                  <h3>
                    Nenhuma transação
                  </h3>

                  <p>
                    Nenhuma movimentação
                    encontrada com os filtros
                    selecionados.
                  </p>
                </div>
              ) : (
                transactions.map(
                  (transaction) => (
                    <div
                      className="transaction"
                      key={transaction.id}
                    >
                      <div className="transaction-info">
                        <strong>
                          {
                            transaction.description
                          }
                        </strong>

                        <span>
                          {transaction.type}
                        </span>
                      </div>

                      <div className="transaction-details">
                        <strong>
                          {
                            transaction.amountFormatted
                          }
                        </strong>

                        <span
                          className={`transaction-status ${transaction.status.toLowerCase()}`}
                        >
                          {
                            transaction.status
                          }
                        </span>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (page === 'withdrawal') {
    return (
      <div className="app">
        {sidebar}

        <main className="main">
          <header className="header">
            <div>
              <h1>Saques</h1>
              <p>
                Solicite um saque para uma chave
                Pix
              </p>
            </div>
          </header>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Novo saque</h2>
                <p>
                  Informe os dados do saque
                </p>
              </div>
            </div>

            <form
              className="checkout-form"
              onSubmit={handleWithdrawal}
            >
              <label>Valor</label>

              <input
                type="number"
                placeholder="50.00"
                value={withdrawalAmount}
                onChange={(e) =>
                  setWithdrawalAmount(
                    e.target.value
                  )
                }
                step="0.01"
                min="0.01"
              />

              <label>Chave Pix</label>

              <input
                type="text"
                placeholder="Chave Pix"
                value={pixKey}
                onChange={(e) =>
                  setPixKey(e.target.value)
                }
              />

              <label>Documento</label>

              <input
                type="text"
                placeholder="CPF ou CNPJ"
                value={withdrawalDocument}
                onChange={(e) =>
                  setWithdrawalDocument(
                    e.target.value
                  )
                }
              />

              <label>Descrição</label>

              <input
                type="text"
                placeholder="Saque para conta pessoal"
                value={withdrawalDescription}
                onChange={(e) =>
                  setWithdrawalDescription(
                    e.target.value
                  )
                }
              />

              <label>
                Referência externa
              </label>

              <input
                type="text"
                placeholder="SAQUE-001"
                value={
                  withdrawalExternalReference
                }
                onChange={(e) =>
                  setWithdrawalExternalReference(
                    e.target.value
                  )
                }
              />

              {withdrawalError && (
                <div className="login-error">
                  {withdrawalError}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={withdrawalLoading}
              >
                {withdrawalLoading
                  ? 'Solicitando...'
                  : 'Solicitar saque'}
              </button>
            </form>

            {withdrawalResult && (
              <div className="checkout-result">
                <h3>
                  Saque solicitado
                </h3>

                <p>
                  Acompanhe o status da
                  solicitação
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  {withdrawalResult.status}
                </p>

                <p>
                  <strong>Valor:</strong>{' '}
                  R${' '}
                  {(
                    Number(
                      withdrawalResult.amount
                    ) / 100
                  ).toFixed(2)}
                </p>

                <p>
                  <strong>
                    Referência:
                  </strong>{' '}
                  {
                    withdrawalResult.externalReference
                  }
                </p>

                <p>
                  <strong>ID:</strong>{' '}
                  {withdrawalResult.id}
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    handleWithdrawalStatus
                  }
                  disabled={
                    withdrawalStatusLoading
                  }
                >
                  {withdrawalStatusLoading
                    ? 'Consultando...'
                    : 'Consultar status'}
                </button>
              </div>
            )}

            {withdrawalStatusResult && (
              <div className="checkout-result">
                <h3>
                  Status atualizado
                </h3>

                <p>
                  <strong>Status:</strong>{' '}
                  {
                    withdrawalStatusResult
                      .withdrawal?.status
                  }
                </p>

                {withdrawalStatusResult.gateway && (
                  <p>
                    <strong>
                      Status Gateway:
                    </strong>{' '}
                    {
                      withdrawalStatusResult
                        .gateway.status
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (page === 'webhooks') {
    return (
      <div className="app">
        {sidebar}

        <main className="main">
          <header className="header">
            <div>
              <h1>Webhooks</h1>
              <p>
                Configure os callbacks do Gateway
              </p>
            </div>
          </header>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>
                  Configurar webhooks
                </h2>

                <p>
                  Cadastre as URLs que receberão
                  os eventos do Gateway
                </p>
              </div>
            </div>

            <form
              className="checkout-form"
              onSubmit={handleRegisterWebhooks}
            >
              <label>
                URL pública da API BaaS
              </label>

              <input
                type="text"
                placeholder="Ex: http://127.0.0.1:3000"
                value={webhookUrl}
                onChange={(e) =>
                  setWebhookUrl(
                    e.target.value
                  )
                }
              />

              <label>
                Secret
              </label>

              <input
                type="text"
                placeholder="Secret opcional"
                value={webhookSecret}
                onChange={(e) =>
                  setWebhookSecret(
                    e.target.value
                  )
                }
              />

              {webhookError && (
                <div className="login-error">
                  {webhookError}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={webhookLoading}
              >
                {webhookLoading
                  ? 'Cadastrando...'
                  : 'Cadastrar webhooks'}
              </button>
            </form>

            {webhookResult && (
              <div className="checkout-result">
                <h3>
                  Webhooks cadastrados
                  com sucesso!
                </h3>

                <p>
                  Os eventos PAYMENT_PIX,
                  PAYMENT_CARD e WITHDRAWAL
                  foram configurados.
                </p>

                {webhookResult.webhooks?.map(
                  (webhook: any) => (
                    <div
                      key={webhook.event}
                    >
                      <p>
                        <strong>
                          {webhook.event}
                        </strong>
                      </p>

                      <p>
                        {webhook.url}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {sidebar}

      <main className="main">
        <header className="header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Visão geral da sua conta
            </p>
          </div>
        </header>

        <section className="cards">
          <div className="card balance-card">
            <div className="card-header">
              <span>
                Saldo disponível
              </span>

              <span className="card-icon">
                R$
              </span>
            </div>

            <strong className="balance">
              {loading
                ? 'Carregando...'
                : balance}
            </strong>

            <span className="card-description">
              Saldo atual da carteira
            </span>
          </div>

          <div className="card">
            <div className="card-header">
              <span>Transações</span>

              <span className="card-icon">
                ↗
              </span>
            </div>

            <strong className="number">
              {transactions.length}
            </strong>

            <span className="card-description">
              Transações realizadas
            </span>
          </div>

          <div className="card">
            <div className="card-header">
              <span>Saques</span>

              <span className="card-icon">
                ↓
              </span>
            </div>

            <strong className="number">
              {
                transactions.filter(
                  (transaction) =>
                    transaction.type ===
                    'WITHDRAWAL'
                ).length
              }
            </strong>

            <span className="card-description">
              Solicitações realizadas
            </span>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>
                  Últimas transações
                </h2>

                <p>
                  Movimentações recentes da
                  carteira
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={() =>
                  setPage('transactions')
                }
              >
                Ver todas
              </button>
            </div>

            <div className="filters">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todos os status
                </option>

                <option value="APPROVED">
                  Aprovado
                </option>

                <option value="DENIED">
                  Negado
                </option>

                <option value="EXPIRED">
                  Expirado
                </option>

                <option value="CANCELLED">
                  Cancelado
                </option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todos os tipos
                </option>

                <option value="PAYMENT">
                  Pagamento
                </option>

                <option value="WITHDRAWAL">
                  Saque
                </option>
              </select>
            </div>

            <div className="transactions-list">
              {transactionsLoading ? (
                <div className="empty-state">
                  <h3>
                    Carregando transações...
                  </h3>
                </div>
              ) : transactions.length ===
                0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    ↗
                  </div>

                  <h3>
                    Nenhuma transação
                  </h3>

                  <p>
                    Quando houver
                    movimentações, elas
                    aparecerão aqui.
                  </p>
                </div>
              ) : (
                transactions.map(
                  (transaction) => (
                    <div
                      className="transaction"
                      key={transaction.id}
                    >
                      <div className="transaction-info">
                        <strong>
                          {
                            transaction.description
                          }
                        </strong>

                        <span>
                          {transaction.type}
                        </span>
                      </div>

                      <div className="transaction-details">
                        <strong>
                          {
                            transaction.amountFormatted
                          }
                        </strong>

                        <span
                          className={`transaction-status ${transaction.status.toLowerCase()}`}
                        >
                          {
                            transaction.status
                          }
                        </span>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Sidebar({
  page,
  setPage,
  onLogout,
}: {
  page: string;
  setPage: (page: string) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="sidebar">
      <nav className="menu">
        <button
          className={`menu-item ${
            page === 'dashboard'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setPage('dashboard')
          }
        >
          <span>⌂</span>
          Dashboard
        </button>

        <button
          className={`menu-item ${
            page === 'checkout'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setPage('checkout')
          }
        >
          <span>↗</span>
          Checkout
        </button>

        <button
          className={`menu-item ${
            page === 'transactions'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setPage('transactions')
          }
        >
          <span>▣</span>
          Transações
        </button>

        <button
          className={`menu-item ${
            page === 'withdrawal'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setPage('withdrawal')
          }
        >
          <span>↓</span>
          Saques
        </button>

        <button
          className={`menu-item ${
            page === 'webhooks'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setPage('webhooks')
          }
        >
          <span>⚙</span>
          Webhooks
        </button>

        <button
          className="menu-item"
          onClick={onLogout}
        >
          <span>↪</span>
          Sair
        </button>
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot"></span>
        Gateway conectado
      </div>
    </aside>
  );
}

export default App;