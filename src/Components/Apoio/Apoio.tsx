import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col
} from "react-bootstrap";
import './Apoio.css';

type Usuario = { id: number; nome: string };
type Produto = { 
  id: number; 
  nome: string;
  descricao?: string;
  valor_meta?: number;
  imagem_capa?: string;
};

function Apoio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [apoio, setApoio] = useState({
    produtoId: 0,   
    valor: 0,
  });
  const [pixData, setPixData] = useState<any>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>(""); // ✅ Novo estado para QR Code
  const [status, setStatus] = useState<string>("");
  const [apoioId, setApoioId] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("Usuário não autenticado!");
      navigate('/login');
      return;
    }

    if (!id) {
      alert("Produto não especificado!");
      navigate('/');
      return;
    }

    const carregarDados = async () => {
      try {
        const decoded: any = jwtDecode(token);
        const user = {
          id: decoded.id || decoded.usuarioId || decoded.sub,
          nome: decoded.nome || decoded.name || decoded.username,
        };

        if (!user.id) {
          throw new Error("ID do usuário não encontrado no token!");
        }

        setUsuarioLogado(user);

        const response = await fetch(`https://crowdfunding-vxjp.onrender.com/api/produto/${id}`);
        if (!response.ok) {
          throw new Error("Produto não encontrado");
        }

        const produtoData = await response.json();
        setProduto(produtoData);
        setApoio({
          produtoId: parseInt(id),
          valor: 0,
        });
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setErro(error instanceof Error ? error.message : "Erro ao carregar produto");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [token, id, navigate]);

  // ✅ Efeito para processar o QR Code quando pixData mudar
  useEffect(() => {
    if (pixData?.brCode) {
      // Se a API já retornou um base64 válido, use ele
      if (pixData.brCodeBase64 && pixData.brCodeBase64.startsWith('data:image')) {
        setQrCodeImage(pixData.brCodeBase64);
        console.log("✅ Usando QR Code da API");
      } else if (pixData.brCode) {
        // Se não, tente gerar localmente (fallback)
        console.log("⚠️ QR Code não veio da API, usando código PIX para exibição");
        // Não geramos localmente para evitar dependência extra
        setQrCodeImage(""); // Limpa o QR Code se não tiver
      }
    }
  }, [pixData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioLogado || !produto) {
      alert("Dados incompletos!");
      return;
    }

    if (apoio.valor <= 0) {
      alert("Por favor, informe um valor válido para o apoio!");
      return;
    }

    const apoioParaEnviar = {
      produto: apoio.produtoId,
      apoiador: usuarioLogado.id,
      valor: apoio.valor,
    };

    try {
      const response = await fetch("https://crowdfunding-vxjp.onrender.com/api/apoio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Token": token || "",
        },
        body: JSON.stringify(apoioParaEnviar),
      });

      if (!response.ok) {
        const erroData = await response.json();
        throw new Error(erroData.error || "Erro ao criar apoio");
      }

      const data = await response.json();
      console.log("✅ Apoio criado:", data);

      setPixData(data.pix);
      setStatus(data.apoio.status);
      setApoioId(data.apoio.id);

      alert("✅ Apoio criado com sucesso! Escaneie o QR Code para pagar.");

      startStatusCheck(data.apoio.id);
    } catch (error) {
      console.error("Erro ao cadastrar apoio:", error);
      alert(error instanceof Error ? error.message : "Erro ao cadastrar apoio");
    }
  };

  const startStatusCheck = (apoioId: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://crowdfunding-vxjp.onrender.com/api/apoio/${apoioId}/status`,
          {
            headers: { 
              "Content-Type": "application/json",
              "Token": token || "",
            },
          }
        );

        if (!response.ok) throw new Error("Erro ao verificar status");
        
        const result = await response.json();
        setStatus(result.pixStatus);

        if (result.pixStatus === "PAID") {
          alert("🎉 Pagamento confirmado com sucesso!");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      }
    }, 10000);
  };

  const simularPagamento = async () => {
    if (!apoioId) return;
    
    // ✅ Verifica se o QR Code foi gerado (não é temporário)
    if (pixData?.id?.startsWith('temp_')) {
      alert("Aguarde a geração completa do QR Code antes de simular o pagamento.");
      return;
    }
    
    try {
      const response = await fetch(
        `https://crowdfunding-vxjp.onrender.com/api/apoio/${apoioId}/simular`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Token": token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao simular pagamento");
      }

      setStatus("PAID");
      alert("✅ Pagamento simulado com sucesso!");
    } catch (error) {
      console.error("Erro ao simular pagamento:", error);
      alert("Erro ao simular pagamento");
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case "PAID": return "status-pago";
      case "PENDING": return "status-pendente";
      case "CREATED": return "status-criado";
      default: return "status-aguardando";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "PAID": return "✅ PAGO";
      case "PENDING": return "⏳ PENDENTE";
      case "CREATED": return "📱 QR CODE GERADO";
      default: return "❌ AGUARDANDO";
    }
  };

  const recarregarQRCode = () => {
    if (pixData?.brCodeBase64) {
      // Força recarregamento da imagem
      setQrCodeImage(pixData.brCodeBase64 + '?t=' + Date.now());
      alert("QR Code recarregado!");
    }
  };

  if (carregando) {
    return (
      <Container className="loading-container">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <h3>Carregando...</h3>
      </Container>
    );
  }

  if (erro) {
    return (
      <Container className="error-container">
        <Alert variant="danger">
          <Alert.Heading>Erro</Alert.Heading>
          <p>{erro}</p>
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/')}>
          ← Voltar para Produtos
        </Button>
      </Container>
    );
  }

  return (
    <Container className="apoio-container">
      <Row className="justify-content-center">
        <Col>
          <Card>
            <Card.Header className="text-center">
              <h2 className="mb-0">💚 Realizar Apoio</h2>
            </Card.Header>
            
            <Card.Body>

              <Card className="produto-info">
                <Card.Body>
                  <Card.Title className="produto-nome">
                    {produto?.nome}
                  </Card.Title>
                  {produto?.descricao && (
                    <Card.Text className="produto-descricao">
                      {produto.descricao}
                    </Card.Text>
                  )}
                  {produto?.valor_meta && (
                    <Card.Text className="produto-meta">
                      Meta: R$ {produto.valor_meta.toLocaleString('pt-BR')}
                    </Card.Text>
                  )}
                </Card.Body>
              </Card>


              {!pixData ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="valorApoio">
                      <strong>Valor do apoio (R$):</strong>
                    </Form.Label>
                    <Form.Control
                      id="valorApoio"
                      type="number"
                      step="0.01"
                      min="1"
                      value={apoio.valor || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setApoio({
                          ...apoio,
                          valor: isNaN(val) ? 0 : val,
                        });
                      }}
                      required
                      className="valor-input"
                      placeholder="Digite o valor do apoio"
                    />
                    <Form.Text className="text-muted">
                      Valor mínimo: R$ 100,00
                    </Form.Text>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    className="btn-apoiar w-100"
                  >
                    💚 Apoiar este Projeto
                  </Button>
                </Form>
              ) : (

                <Card className="pix-section mt-4">
                  <Card.Header>
                    <h4 className="mb-0">💳 Pague com PIX</h4>
                  </Card.Header>
                  <Card.Body>
 
                    <div className="qr-code">
                      {qrCodeImage ? (
                        <>
                          <img
                            src={qrCodeImage} // ✅ Usa qrCodeImage diretamente
                            alt="QR Code PIX"
                            className="img-fluid"
                            style={{ 
                              maxWidth: "250px", 
                              border: "1px solid #ddd", 
                              borderRadius: "8px",
                              display: "block",
                              margin: "0 auto"
                            }}
                          />
                          <div className="text-center mt-2">
                            <Button 
                              variant="outline-info" 
                              size="sm"
                              onClick={recarregarQRCode}
                            >
                              🔄 Recarregar QR Code
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="qr-placeholder text-center">
                          <p>QR Code gerado com sucesso!</p>
                          <small>Use o código PIX abaixo para pagar</small>
                          <div className="mt-3">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => {
                                // Copia o código PIX
                                navigator.clipboard.writeText(pixData.brCode);
                                alert("Código PIX copiado! Cole no seu app de banco.");
                              }}
                            >
                              📋 Copiar Código PIX
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Form.Group className="mt-3">
                      <Form.Label>
                        <strong>Código PIX (Copie e Cole):</strong>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={pixData.brCode}
                        readOnly
                        className="pix-code"
                        onClick={(e) => {
                          (e.target as HTMLTextAreaElement).select();
                          navigator.clipboard.writeText(pixData.brCode);
                          alert("Código PIX copiado!");
                        }}
                      />
                      <Form.Text className="text-muted">
                        Clique no código para copiar
                      </Form.Text>
                    </Form.Group>

                    <div className="payment-info mt-3">
                      <Row>
                        <Col md={6}>
                          {/* ✅ CORREÇÃO: Use amount ou valor com fallback */}
                          <strong>Valor:</strong> R$ {(pixData.amount || pixData.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Col>
                        <Col md={6}>
                          <strong>Status: </strong>
                          <span className={getStatusClass()}>
                            {getStatusText()}
                          </span>
                        </Col>
                      </Row>
                      {/* ✅ CORREÇÃO: Use expiresAt (com A maiúsculo) */}
                      {pixData.expiresAt && (
                        <div className="mt-2">
                          <strong>Expira em:</strong> {new Date(pixData.expiresAt).toLocaleString('pt-BR')}
                        </div>
                      )}
                      {/* Fallback para expires_at (minúsculo) se existir */}
                      {!pixData.expiresAt && pixData.expires_at && (
                        <div className="mt-2">
                          <strong>Expira em:</strong> {new Date(pixData.expires_at).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>

                    {process.env.NODE_ENV === 'development' && status !== "PAID" && (
                      <div className="mt-3 text-center">
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={simularPagamento}
                        >
                          🧪 Simular Pagamento (Dev)
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}

              <div className="text-center mt-3">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/')}
                >
                  ← Voltar para Produtos
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Apoio;