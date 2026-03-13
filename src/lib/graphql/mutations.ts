export const ADD_TO_CART = `
  mutation AddToCart($productId: Int!, $quantity: Int!) {
    addToCart(input: {
      productId: $productId,
      quantity: $quantity
    }) {
      cartItem {
        key
        quantity
      }
    }
  }
`;

export const CHECKOUT_MUTATION = `
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      clientMutationId
      order {
        id
        orderKey
        orderNumber
        status
        total
      }
      result
      redirect
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(input: {
      username: $username,
      password: $password
    }) {
      authToken
      refreshToken
      user {
        id
        databaseId
        name
        email
        firstName
        lastName
      }
    }
  }
`;

export const REGISTER_USER_MUTATION = `
  mutation RegisterUser($username: String!, $email: String!, $password: String!) {
    registerUser(input: {
      username: $username,
      email: $email,
      password: $password
    }) {
      user {
        id
        databaseId
        username
        email
      }
    }
  }
`;
