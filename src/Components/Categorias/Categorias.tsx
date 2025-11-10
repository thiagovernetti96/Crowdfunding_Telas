import { useEffect, useState } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../Categorias/Categorias.css';

type Categoria = { id: number; nome: string };

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/categoria", {
          headers: {
            "Content-Type": "application/json"          
          }
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar categorias.");
        }

        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };

    fetchCategoria();
  }, []);

  const handleCategoriaClick = (categoriaNome: string) => {
    navigate(`/?categoria=${encodeURIComponent(categoriaNome)}`);
  };

  return (
    <Container className="my-4">
      <h2 className="mb-3">Categorias</h2>
      <Row>
        <Col>
          <div className="categorias-container">
            {categorias.map((categoria) => (
              <Button
                key={categoria.id}
                variant="outline-primary"
                className="categoria-btn me-2 mb-2 "
                onClick={() => handleCategoriaClick(categoria.nome)}
              >
                {categoria.nome}
              </Button>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Categorias;