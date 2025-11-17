import axios, { AxiosInstance, AxiosError } from 'axios';
import { VismaClientConfig, VismaError, TokenResponse } from './types';

export class VismaEAccountingClient {
  private axiosInstance: AxiosInstance;
  private accessToken?: string;
  private onTokenRefresh?: (newToken: TokenResponse) => void | Promise<void>;
  private readonly baseURL: string;

  constructor(config: VismaClientConfig) {
    this.baseURL = config.apiUrl || 'https://eaccountingapi.vismaonline.com';
    this.accessToken = config.accessToken;
    this.onTokenRefresh = config.onTokenRefresh;

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const vismaError: VismaError = {
          message: error.message,
          statusCode: error.response?.status,
        };

        if (error.response?.data) {
          const data = error.response.data as any;
          if (data.message) {
            vismaError.message = data.message;
          }
          if (data.errors) {
            vismaError.errors = data.errors;
          }
        }

        return Promise.reject(vismaError);
      }
    );
  }

  /**
   * Set or update the access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, { params });
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint);
    return response.data;
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data);
    return response.data;
  }

  /**
   * Get OAuth2 authorization URL
   */
  static getAuthorizationUrl(params: {
    clientId: string;
    redirectUri: string;
    scope?: string;
    state?: string;
  }): string {
    const baseUrl = 'https://identity.vismaonline.com/connect/authorize';
    const scope = params.scope || 'ea:api ea:sales offline_access';

    const queryParams = new URLSearchParams({
      client_id: params.clientId,
      redirect_uri: params.redirectUri,
      response_type: 'code',
      scope: scope,
      ...(params.state && { state: params.state }),
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async getAccessToken(params: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
  }): Promise<TokenResponse> {
    const tokenUrl = 'https://identity.vismaonline.com/connect/token';

    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: params.clientId,
      client_secret: params.clientSecret,
    });

    try {
      const response = await axios.post<TokenResponse>(tokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get access token: ${error.response?.data?.error_description || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(params: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }): Promise<TokenResponse> {
    const tokenUrl = 'https://identity.vismaonline.com/connect/token';

    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: params.refreshToken,
      client_id: params.clientId,
      client_secret: params.clientSecret,
    });

    try {
      const response = await axios.post<TokenResponse>(tokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to refresh token: ${error.response?.data?.error_description || error.message}`
        );
      }
      throw error;
    }
  }
}
