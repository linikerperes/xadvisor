import { useRef, useState } from "react";
import { Camera, Loader2, User, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AvatarUploadProps {
  clientId: number;
  currentPhotoUrl?: string | null;
  clientName: string;
  size?: "sm" | "md" | "lg";
  onUploadSuccess?: (url: string) => void;
}

const sizeMap = {
  sm: { container: "h-12 w-12", icon: "h-5 w-5", camera: "h-3.5 w-3.5", badge: "h-5 w-5 -bottom-0.5 -right-0.5" },
  md: { container: "h-16 w-16", icon: "h-7 w-7", camera: "h-4 w-4", badge: "h-6 w-6 -bottom-1 -right-1" },
  lg: { container: "h-24 w-24", icon: "h-10 w-10", camera: "h-5 w-5", badge: "h-8 w-8 -bottom-1 -right-1" },
};

export function AvatarUpload({ clientId, currentPhotoUrl, clientName, size = "md", onUploadSuccess }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const s = sizeMap[size];

  const uploadPhoto = trpc.advisorCrm.uploadPhoto.useMutation({
    onSuccess: (data) => {
      toast.success("Foto atualizada com sucesso!");
      onUploadSuccess?.(data.url);
      setUploading(false);
    },
    onError: (err) => {
      toast.error("Erro ao enviar foto: " + err.message);
      setPreview(null);
      setUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação: apenas imagens, máximo 5MB
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione apenas arquivos de imagem (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setUploading(true);
      uploadPhoto.mutate({ clientId, base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const displayUrl = preview || currentPhotoUrl;
  const initials = clientName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative inline-block group cursor-pointer" onClick={() => !uploading && inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Avatar */}
      <div className={`${s.container} rounded-full overflow-hidden border-2 border-primary/30 bg-primary/10 flex items-center justify-center transition-all group-hover:border-primary/60`}>
        {uploading ? (
          <Loader2 className={`${s.icon} text-primary animate-spin`} />
        ) : displayUrl ? (
          <img src={displayUrl} alt={clientName} className="w-full h-full object-cover" />
        ) : (
          <span className={`font-bold text-primary ${size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"}`}>
            {initials || <User className={s.icon} />}
          </span>
        )}
      </div>

      {/* Badge câmera */}
      {!uploading && (
        <div className={`absolute ${s.badge} rounded-full bg-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}>
          <Camera className={`${s.camera} text-primary-foreground`} />
        </div>
      )}
    </div>
  );
}

/** Versão somente leitura (sem upload) para listas */
export function ClientAvatar({
  photoUrl,
  name,
  size = "md",
}: {
  photoUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const s = sizeMap[size];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`${s.container} rounded-full overflow-hidden border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0`}>
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className={`font-bold text-primary ${size === "lg" ? "text-2xl" : size === "md" ? "text-base" : "text-xs"}`}>
          {initials || <User className={s.icon} />}
        </span>
      )}
    </div>
  );
}
