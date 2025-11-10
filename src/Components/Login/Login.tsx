import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { InputGroup } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

import "../Login/Login.css";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { login } = useAuth();

 const validarUsuario = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      throw new Error("Email ou senha inválidos");
    }

    const data = await response.json();
    console.log("Resposta do servidor:", data); 

    const token = data.token;
    const nome = data.nome;
    
    if (token && nome) {
      login(token, nome);
    } else {
      console.warn("Estrutura inesperada:", data);
      alert("Dados de login incompletos recebidos do servidor.");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao fazer login");
  }
};


  return (
    <div className="login-container">
      <form className="login-form" onSubmit={validarUsuario}>
        <h2>Login</h2>

        <InputGroup className="mb-3" size="lg">
          <InputGroup.Text>
            <FontAwesomeIcon icon={faEnvelope} />
          </InputGroup.Text>
          <Form.Control
            id="email"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>

        <InputGroup className="mb-3" size="lg">
          <InputGroup.Text>
            <FontAwesomeIcon icon={faLock} />
          </InputGroup.Text>
          <Form.Control
            id="senha"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </InputGroup>

        <Button variant="success" type="submit" className="login-button">
          Entrar
        </Button>
        <Link to="/cadastroUsuario"><Button variant="primary" className="cadastro-button">Criar Conta</Button></Link>
      </form>
    </div>
  );
}

export default Login;

