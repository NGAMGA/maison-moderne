import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Order, OrdersByStatus, OrderStatus, OrderSummary } from '@/types/orders'
import { labelStatus, pluck } from '@/types/orders'

const orderStatuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled']

// Temporaire : les commandes viennent encore du JSON local, jusqu'au jalon 3.
async function fetchLocalOrders(): Promise<Order[]> {
  const response = await fetch('/data/orders.json')
  if (!response.ok) {
    throw new Error(`La requête a échoué (${response.status} ${response.statusText}).`)
  }
  return (await response.json()) as Order[]
}

function OrderList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['local-orders'],
    queryFn: fetchLocalOrders,
  })
  let content: ReactNode

  if (isLoading) {
    content = <p className="fetch-message" role="status">Chargement des commandes…</p>
  } else if (error) {
    content = <p className="fetch-message error-message" role="alert">{error.message}</p>
  } else {
    const orders = data ?? []
    const ordersByStatus: OrdersByStatus = {
      pending: [],
      paid: [],
      shipped: [],
      cancelled: [],
    }

    for (const order of orders) {
      ordersByStatus[order.status].push(order)
    }

    const totalRevenue = pluck(orders, 'total').reduce((total, amount) => total + amount, 0)

    content = (
      <>
        <div className="order-summary-strip" aria-label="Résumé des commandes">
          {orderStatuses.map((status) => (
            <div className="summary-cell" key={status}>
              <span>{labelStatus(status)}</span>
              <strong>{ordersByStatus[status].length}</strong>
            </div>
          ))}
        </div>
        <p className="orders-total">Montant total des commandes : <strong>{totalRevenue} €</strong></p>
        {orders.length === 0 ? (
          <p className="fetch-message">Aucune commande pour le moment.</p>
        ) : (
          <div className="order-list">
            {orders.map((order) => {
              const summary: OrderSummary = {
                id: order.id,
                customerEmail: order.customerEmail,
                total: order.total,
              }

              return (
                <article className="order-row" key={summary.id}>
                  <div><span>Commande</span><strong>{summary.id}</strong></div>
                  <div><span>Client</span><strong>{summary.customerEmail}</strong></div>
                  <div><span>Date</span><strong>{new Date(String(order.createdAt)).toLocaleDateString('fr-FR')}</strong></div>
                  <div><span>Total</span><strong>{summary.total} €</strong></div>
                  <span className={`order-status status-${order.status}`}>{labelStatus(order.status)}</span>
                </article>
              )
            })}
          </div>
        )}
      </>
    )
  }

  return <div className="orders-content">{content}</div>
}

export default OrderList