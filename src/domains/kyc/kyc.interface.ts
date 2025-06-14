const identityProviders = ["prembly"] as const;
export type IdentityProvider = (typeof identityProviders)[number];

const identityTypes = ["bvn"] as const;
export type IdentityType = (typeof identityTypes)[number];

export interface BaseResponse {
  status: number;
  message: string;
  provider: IdentityProvider;
  submitted_data: {
    identity_type: IdentityType;
    identity_value: string;
    image: string;
  };
}

interface SuccessResponse extends BaseResponse {
  success: true;
  response: {
    face_data: {
      status: boolean;
      message: string;
      confidence: number;
    };
    user_info: {
      bvn: string;
      first_name: string;
      last_name: string;
      middle_name: string;
      email: string;
      phone_number: string;
      dob: string;
      nin: string;
      base64_image: string;
      other_phone_number: string | undefined;
      registration_date: string | undefined;
      watch_listed?: string | undefined;
    };
  };
}

interface ErrorResponse extends BaseResponse {
  success: false;
  response: null;
}

export type KYCResponse = SuccessResponse | ErrorResponse;
