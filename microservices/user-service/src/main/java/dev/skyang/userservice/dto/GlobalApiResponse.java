package dev.skyang.userservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * A generic, standardized API response wrapper.
 * Using @JsonInclude(JsonInclude.Include.NON_NULL) ensures that null fields are not included in the JSON output.
 *
 * @param <T> The type of the data payload.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GlobalApiResponse<T> {

    private int code;
    private String message;
    private T data;

    // Constructors
    public GlobalApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // Static factory methods for convenience

    /**
     * Creates a success response with data.
     */
    public static <T> GlobalApiResponse<T> success(T data) {
        return new GlobalApiResponse<>(200, "Success", data);
    }

    /**
     * Creates a success response with a custom message and data.
     */
    public static <T> GlobalApiResponse<T> success(String message, T data) {
        return new GlobalApiResponse<>(200, message, data);
    }

    /**
     * Creates a success response with only a message.
     */
    public static <T> GlobalApiResponse<T> success(String message) {
        return new GlobalApiResponse<>(200, message, null);
    }

    /**
     * Creates an error response.
     */
    public static <T> GlobalApiResponse<T> error(int code, String message) {
        return new GlobalApiResponse<>(code, message, null);
    }


    // Getters and Setters
    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
