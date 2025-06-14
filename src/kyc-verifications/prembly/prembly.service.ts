import { URLSearchParams } from "url";
import type { PremblyBVNResponse } from "./prembly.interface";
import { premblyConfig } from "../../config/prembly.config";
import type { KYCResponse } from "../../domains/kyc/kyc.interface";

class PremblyService {
  private config = premblyConfig();

  public async BVNWithFace(bvn: string, image: string): Promise<KYCResponse> {
    try {
      const encodedParams = new URLSearchParams();
      encodedParams.set("number", bvn);
      encodedParams.set("image", image);

      const response = await fetch(
        `${this.config.baseURL}/identitypass/verification/bvn_w_face`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/x-www-form-urlencoded",
            "x-api-key": this.config.apikey,
            "app-id": this.config.appId,
          },
          body: encodedParams.toString(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          status: 400,
          message: error.message,
          provider: "prembly",
          response: null,
          submitted_data: {
            identity_type: "bvn",
            identity_value: bvn,
            image: image,
          },
        };
      }

      const data = (await response.json()) as PremblyBVNResponse;

      if (!data.status) {
        return {
          success: false,
          status: 400,
          message: data.detail,
          provider: "prembly",
          response: null,
          submitted_data: {
            identity_type: "bvn",
            identity_value: bvn,
            image: image,
          },
        };
      }

      return {
        message: "BVN verification successful",
        success: data.status,
        status: 200,
        provider: "prembly",
        response: {
          face_data: {
            status: data.face_data.status,
            message: data.face_data.message,
            confidence: data.face_data.confidence,
          },
          user_info: {
            bvn: data.bvn_data.bvn,
            first_name: data.bvn_data.firstName,
            last_name: data.bvn_data.lastName,
            middle_name: data.bvn_data.middleName,
            email: data.bvn_data.email,
            phone_number: data.bvn_data.phoneNumber1,
            other_phone_number: data.bvn_data.phoneNumber2,
            dob: data.bvn_data.dateOfBirth,
            nin: data.bvn_data.nin,
            watch_listed: data.bvn_data.watchListed,
            base64_image: data.bvn_data.base64Image,
            registration_date: data.bvn_data.registrationDate,
          },
        },
        submitted_data: {
          identity_type: "bvn",
          identity_value: bvn,
          image: image,
        },
      };
    } catch (error) {
      console.error("Error verifying BVN:", JSON.stringify(error ?? {}));
      return {
        message: (error as Error)?.message ?? "Internal server error",
        success: false,
        status: 500,
        provider: "prembly",
        submitted_data: {
          identity_type: "bvn",
          identity_value: bvn,
          image: image,
        },
        response: null,
      };
    }
  }
}

export default new PremblyService(); 
