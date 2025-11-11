import {useState} from 'react'
import { Link } from 'react-router-dom';
import '../Usuario/CadastroUsuario.css'
import { InputGroup } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock,faUser } from "@fortawesome/free-solid-svg-icons";


type UsuarioData={
  email:string
  senha:string
  nome:string

}
function CadastroUsuario() {
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const[nome,setNome] = useState<string>('')

  const handleChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const dados: UsuarioData={email,senha,nome}
    try{
      const response = await fetch("https://crowdfunding-vxjp.onrender.com/api/usuario",{
        method:"POST",
        headers:{
          "Content-Type": "application/json"
        },
        body:JSON.stringify(dados)
      });
      if (!response.ok) {
        throw new Error("Algo de errado aconteceu ao adicionar o usuário."+response.status);
      }
      const data = await response.json();
      console.log("Usuário adicionado com sucesso:", data);
      alert('Usuário adicionado com sucesso')
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
    <div className='cadastro-container'>
      <form className='cadastroForm' onSubmit={handleChange}>
        <h2>Cadastro de Usuário</h2>
        <div className='form-group'>

          <InputGroup className='mb-3' size="lg">
            <InputGroup.Text>
              <FontAwesomeIcon icon={faUser} />
            </InputGroup.Text>
            <Form.Control
              id= "nome"
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(n)=>setNome(n.target.value)}          
            />
          </InputGroup>
          <InputGroup className="mb-3" size="lg">
            <InputGroup.Text>
              <FontAwesomeIcon icon={faEnvelope}/>
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

        </div>       
        <Button variant="primary" type="submit" className="cadastro-button">
          Cadastrar
        </Button>
      </form>
    </div>
    </>
  );
}
export default CadastroUsuario;