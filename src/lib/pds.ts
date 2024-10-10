export async function getPDSfromDID(did: string) {
  const res = await fetch(`https://pds.directory/${did}`);
  if (!res.ok) return;
  const data: DIDDocument = await res.json();
  const service = data?.service?.find((x) => x?.id === "#atproto_pds");
  if (service) {
    //entryway
    if (service.serviceEndpoint.endsWith("bsky.network"))
      return "https://bsky.social";
    // custom pds
    return service.serviceEndpoint;
  }
}

interface DIDDocument {
  "@context": string[];
  id: string;
  alsoKnownAs?: string[];
  verificationMethod?: VerificationMethod[];
  service?: Service[];
}

interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase: string;
}

interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
}
