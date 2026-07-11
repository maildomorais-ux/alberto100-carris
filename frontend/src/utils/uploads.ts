import * as ImagePicker from "expo-image-picker";
import { Keyboard, Platform } from "react-native";

export type UploadResult = { url: string; kind: "image" | "video"; filename: string };

const API = process.env.EXPO_PUBLIC_BACKEND_URL || "";

async function uploadFromRN(uri: string, mimeType: string | undefined, token: string): Promise<UploadResult> {
  const form = new FormData();
  const ext = (uri.split(".").pop() || "").toLowerCase().split("?")[0];
  const isVideo = mimeType?.startsWith("video") || ["mov", "mp4", "m4v", "webm"].includes(ext);
  const filename = `upload.${ext || (isVideo ? "mp4" : "jpg")}`;
  // @ts-ignore React Native FormData accepts { uri, name, type }
  form.append("file", { uri, name: filename, type: mimeType || (isVideo ? "video/mp4" : "image/jpeg") });
  const res = await fetch(`${API}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form as any,
  });
  if (!res.ok) throw new Error(`upload failed: ${res.status}`);
  return res.json();
}

async function uploadFromWebFile(file: File, token: string): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await fetch(`${API}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`upload failed: ${res.status}`);
  return res.json();
}

// Web: open a native <input type="file"> so Safari treats the tap as a genuine file picker gesture.
// Must be invoked SYNCHRONOUSLY inside the user gesture (no awaits before creating the input).
function pickOnWeb(kind: "image" | "video"): Promise<File | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") { resolve(null); return; }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "video" ? "video/*" : "image/*";
    input.style.position = "fixed";
    input.style.left = "-9999px";
    input.style.top = "0";
    let done = false;
    const finish = (f: File | null) => {
      if (done) return; done = true;
      try { document.body.removeChild(input); } catch {}
      resolve(f);
    };
    input.onchange = () => finish(input.files && input.files[0] ? input.files[0] : null);
    // Safety timeout in case dialog is dismissed with no event fired
    setTimeout(() => { if (!done && !input.files?.[0]) finish(null); }, 60_000);
    document.body.appendChild(input);
    input.click();
  });
}

export async function pickAndUpload(kind: "image" | "video", token: string): Promise<UploadResult | null> {
  // Web path — must trigger file input synchronously to satisfy Safari's gesture requirement.
  if (Platform.OS === "web") {
    const file = await pickOnWeb(kind);
    if (!file) return null;
    return uploadFromWebFile(file, token);
  }
  // Native path — dismiss keyboard so the tap isn't captured by any focused TextInput.
  try { Keyboard.dismiss(); } catch {}
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("permission_denied");
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: kind === "video" ? ["videos"] : ["images"],
    quality: 0.8,
    allowsMultipleSelection: false,
    videoMaxDuration: 180,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  return uploadFromRN(asset.uri, asset.mimeType, token);
}
