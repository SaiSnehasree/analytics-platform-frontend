import { useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff } from "lucide-react";
export default function SignupPage() {

    const [workspaceName, setWorkspaceName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const handleSignup = async () => {

        try {

            const response = await api.post("/auth/signup", {
                workspaceName,
                ownerName,
                email,
                password
            });

            alert(response.data.message || "Signup successful!");
            navigate("/");
        } catch (error) {

            console.error(error);

            alert("Signup Failed");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                <h1 style={styles.title}>
                    Create Workspace
                </h1>

                <p style={styles.subtitle}>
                    Build your analytics platform in minutes
                </p>

                <input
                    placeholder="Workspace Name"
                    style={styles.input}
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                />

                <input
                    placeholder="Owner Name"
                    style={styles.input}
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                />

                <input
                    placeholder="Email Address"
                    style={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div style={{ position: "relative", marginBottom: "15px" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            right: "12px",
                            top: "14px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8"
                        }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <button
                    style={styles.button}
                    onClick={handleSignup}
                >
                    Create Workspace
                </button>

                <p style={styles.footer}>
                    Already have an account?
                    <Link to="/" style={styles.link}>
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

const styles = {
    container:{
        minHeight:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        background:"#0f172a"
    },

    card:{
        width:"420px",
        padding:"40px",
        borderRadius:"20px",
        background:"#1e293b",
        boxShadow:"0 0 30px rgba(0,0,0,0.3)"
    },

    title:{
        textAlign:"center",
        marginBottom:"10px",
        color : "#ffffff"
    },

    subtitle:{
        textAlign:"center",
        color:"#94a3b8",
        marginBottom:"30px"
    },

    input:{
        width:"100%",
        padding:"14px",
        marginBottom:"15px",
        borderRadius:"10px",
        border:"1px solid #334155",
        background:"#0f172a",
        color:"white"
    },

    button:{
        width:"100%",
        padding:"14px",
        borderRadius:"10px",
        border:"none",
        background:"#3b82f6",
        color:"white",
        fontWeight:"bold",
        cursor:"pointer"
    },

    footer:{
        marginTop:"20px",
        textAlign:"center",
        color:"white"
    },

    link:{
        marginLeft:"5px",
        color:"#60a5fa"
    }
};