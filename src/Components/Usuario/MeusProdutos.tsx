// MeusProdutos.tsx - atualizado
import { useEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Alert, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type Produto = {
  id: number; 
  nome: string; 
  descricao: string; 
  imagem_capa?: string;
  valor_meta?: number;
  valor_arrecadado?: number;
  criador_id?: string;
  categoria: {
    id: number;
    nome: string;
  };
};

function MeusProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const { nome, isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && nome && token) {
      carregarMeusProdutos();
    }
  }, [nome, isAuthenticated, token]);

  const carregarMeusProdutos = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await fetch(`http://localhost:3000/api/produto/criador/${encodeURIComponent(nome ?? '')}/com-arrecadacao`, {
        headers: {
          "Content-Type": "application/json",
          "Token": token || "",
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar seus produtos.");
      }

      const data = await response.json();
      console.log("Meus produtos:", data);
      
      const produtosArray = Array.isArray(data) ? data : [data].filter(Boolean);
      setProdutos(produtosArray);
      
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setErro('Erro ao carregar seus produtos');
    } finally {
      setCarregando(false);
    }
  };

   const deletarProduto = async (id: number) => {
    const confirmacao = window.confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmacao) return;

  const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:3000/api/produto/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Token": token ?? ""
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar produto: ${response.status}`);
    }

    setProdutos(produtos.filter((produto) => produto.id !== id));
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
  }
};

  const calcularProgresso = (produto: Produto) => {
    if (!produto.valor_meta || produto.valor_meta === 0) return 0;
    if (!produto.valor_arrecadado) return 0;
    return Math.min((produto.valor_arrecadado / produto.valor_meta) * 100, 100);
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Container className="my-4">

      {produtos.length === 0 && !carregando ? (
        <Alert variant="info">
          Você ainda não tem produtos cadastrados.
        </Alert>
      ) : (
        <Row>
          {produtos.map((produto) => (
            <Col key={produto.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 card-produto">
                {produto.imagem_capa && (
                  <Card.Img 
                    variant="top" 
                    src={produto.imagem_capa} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  {produto.categoria && (
                    <div className="mb-2">
                      <span className="badge bg-primary">{produto.categoria.nome}</span>
                    </div>
                  )}
                  <Card.Title>{produto.nome}</Card.Title>
                  <Card.Text className="flex-grow-1">
                    {produto.descricao}
                  </Card.Text>
                  
                  {produto.valor_meta && (
                    <div className="mt-auto">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">
                            Arrecadado: R$ {formatarValor(produto.valor_arrecadado || 0)}
                          </small>
                          <small className="text-muted">
                            Meta: R$ {formatarValor(produto.valor_meta)}
                          </small>
                        </div>
                        <ProgressBar 
                          now={calcularProgresso(produto)} 
                          variant={calcularProgresso(produto) >= 100 ? "success" : "primary"}
                          style={{ height: '8px' }}
                        />
                        <div className="text-center mt-1">
                          <small className="text-muted">
                            {calcularProgresso(produto).toFixed(1)}% da meta
                          </small>
                        </div>
                      </div>
                      
                      <div className="d-grid gap-2">
                        <Link to={`/editarProduto/${produto.id}`}>
                          <Button variant="warning" className="w-100">
                            ✏️ Editar Produto
                          </Button>
                        </Link>
                        <Link to={`/cadastrarProduto`}>
                          <Button variant="success" className="w-100">
                            ➕ Cadastrar Novo Produto
                          </Button>
                        </Link> 
                        <Button 
                          variant="danger" 
                          onClick={() => deletarProduto(produto.id)}
                        >
                          🗑️ Deletar Produto
                        </Button>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default MeusProdutos;