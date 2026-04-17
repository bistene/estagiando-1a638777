import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    window.location.replace("/estagiando/index.html");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p>Carregando Estagiando...</p>
    </div>
  );
};

export default Index;
