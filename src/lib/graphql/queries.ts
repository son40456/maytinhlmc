export const GET_FEATURED_PRODUCTS = `
  query GetFeaturedProducts($first: Int = 4) {
    products(where: { featured: true }, first: $first) {
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          sku
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
        }
        ... on VariableProduct {
          price
          sku
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_CATEGORIES = `
  query GetProductCategories($first: Int = 10) {
    productCategories(first: $first, where: { hideEmpty: true, parent: 0 }) {
      nodes {
        id
        name
        slug
        count
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory(
    $slugId: ID!, 
    $slugStr: String!,
    $first: Int = 24, 
    $after: String = "",
    $minPrice: Float,
    $maxPrice: Float,
    $orderBy: [ProductsOrderbyInput] = [{ field: DATE, order: DESC }],
    $taxFilters: [ProductTaxonomyFilterInput]
  ) {
    productCategory(id: $slugId, idType: SLUG) {
      id
      name
      description
    }
    products(
      first: $first, 
      after: $after, 
      where: { 
        categoryIn: [$slugStr], 
        minPrice: $minPrice, 
        maxPrice: $maxPrice, 
        orderby: $orderBy,
        taxonomyFilter: { filters: $taxFilters }
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          sku
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
        }
        ... on VariableProduct {
          price
          sku
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;


export const GET_PRODUCT_BY_SLUG = `
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      shortDescription
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      productCategories {
        nodes {
          name
          slug
        }
      }
      ... on SimpleProduct {
        price
        sku
          regularPrice
        salePrice
        stockStatus
      }
      ... on VariableProduct {
        price
        sku
          regularPrice
        salePrice
        stockStatus
        attributes {
          nodes {
            name
            options
          }
        }
      }
    }
  }
`;

export const SEARCH_PRODUCTS = `
  query SearchProducts($search: String!, $first: Int = 24, $after: String = "") {
    products(where: { search: $search }, first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          sku
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
        }
        ... on VariableProduct {
          price
          sku
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;


export const GET_CUSTOMER_DETAILS = `
  query GetCustomerDetails {
    customer {
      id
      databaseId
      firstName
      lastName
      displayName
      email
      billing {
        firstName
        lastName
        address1
        city
        state
        postcode
        phone
        email
      }
      shipping {
        firstName
        lastName
        address1
        city
        state
        postcode
        phone
      }
      orders {
        nodes {
          id
          databaseId
          orderNumber
          date
          status
          total
          subtotal
          paymentMethodTitle
          shippingTotal
          shippingMethod
          lineItems {
            nodes {
              product {
                node {
                  name
                  slug
                  image {
                    sourceUrl
                  }
                }
              }
              quantity
              total
              subtotal
            }
          }
        }
      }
    }
  }
`;

export const GET_MENU_ITEMS = `
  query GetMenuItems($location: MenuLocationEnum = PRIMARY) {
    menuItems(where: { location: $location }, first: 100) {
      nodes {
        id
        label
        url
        path
        parentId
        cssClasses
      }
    }
  }
`;

export const GET_NODE_BY_SLUG = `
  query GetNodeBySlug(
    $slugId: ID!, 
    $slugStr: String!,
    $first: Int = 24, 
    $after: String = "",
    $minPrice: Float,
    $maxPrice: Float,
    $orderBy: [ProductsOrderbyInput] = [{ field: DATE, order: DESC }],
    $taxFilters: [ProductTaxonomyFilterInput]
  ) {
    product(id: $slugId, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      shortDescription
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      productCategories {
        nodes {
          name
          slug
        }
      }
      related {
        nodes {
          id
          databaseId
          name
          slug
          image {
            sourceUrl
            altText
          }
          ... on SimpleProduct {
            price
            sku
          regularPrice
            salePrice
          }
          ... on VariableProduct {
            price
            sku
          regularPrice
            salePrice
          }
        }
      }
      ... on SimpleProduct {
        price
        sku
          regularPrice
        salePrice
        stockStatus
      }
      ... on VariableProduct {
        price
        sku
          regularPrice
        salePrice
        stockStatus
        attributes {
          nodes {
            name
            options
          }
        }
      }
    }
    productCategory(id: $slugId, idType: SLUG) {
      id
      name
      description
      slug
      parent {
        node {
          id
          name
          slug
          image {
            sourceUrl
          }
          children(first: 100) {
            nodes {
              id
              name
              slug
              image {
                sourceUrl
              }
            }
          }
        }
      }
      children(first: 100) {
        nodes {
          id
          name
          slug
          image {
            sourceUrl
          }
        }
      }
    }
    categoryProducts: products(
      first: $first, 
      after: $after, 
      where: { 
        categoryIn: [$slugStr], 
        minPrice: $minPrice, 
        maxPrice: $maxPrice, 
        orderby: $orderBy,
        taxonomyFilter: { filters: $taxFilters }
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          sku
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
        }
        ... on VariableProduct {
          price
          sku
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export const GET_CATEGORY_FILTERS = `
  query GetCategoryFilters(
    $slugId: ID!
    $slugStr: String!
  ) {
    productCategory(id: $slugId, idType: SLUG) {
      id
      databaseId
      name
      slug
    }
    filterDiscovery: products(
      first: 250, 
      where: { categoryIn: [$slugStr] }
    ) {
      nodes {
        ... on SimpleProduct {
          attributes {
            nodes {
              name
              label
              ... on GlobalProductAttribute {
                slug
                terms {
                  nodes {
                    name
                    slug
                    ... on PaThuongHieu {
                      logo {
                        logo {
                          node {
                            sourceUrl
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        ... on VariableProduct {
          attributes {
            nodes {
              name
              label
              ... on GlobalProductAttribute {
                slug
                terms {
                  nodes {
                    name
                    slug
                    ... on PaThuongHieu {
                      logo {
                        logo {
                          node {
                            sourceUrl
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
