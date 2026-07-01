import * as ImagePicker from "expo-image-picker";

export type UploadResult = { url: string; kind: "image" | "video"; filename: string };

const API = process.env.EXPO_PUBLIC_BACKEND_URL || "";

export async function uploadMedia(
  uri: string,
  mimeType: string | undefined,
  token: string,
): Promise<UploadResult> {
  const form = new FormData();
  const ext = (uri.split(".").pop() || "").toLowerCase();
  const isVideo = mimeType?.startsWith("video") || ["mov","mp4","m4v","webm"].includes(ext);
  const filename = `upload.${ext || (isVideo ? "mp4" : "jpg")}`;
  // React Native FormData accepts { uri, name, type } objects
  // On web, fetch to blob first
  // @ts-ignore
  form.append("file", { uri, name: filename, type: mimeType || (isVideo ? "video/mp4" : "image/jpeg") });
  const res = await fetch(`${API}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form as any,
  });
  if (!res.ok) throw new Error(`upload failed: ${res.status}`);
  return res.json();
}

export async function pickAndUpload(
  kind: "image" | "video",
  token: string,
): Promise<UploadResult | null> {
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
  return uploadMedia(asset.uri, asset.mimeType, token);
}
