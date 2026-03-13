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

export const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        firstName
        lastName
        email
        billing {
          firstName lastName address1 city state postcode phone email
        }
        shipping {
          firstName lastName address1 city state postcode phone
        }
      }
    }
  }
`;

export const UPDATE_USER_MUTATION = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        firstName
        lastName
        email
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
