export enum PaymentProvider {
    /// <summary>
    /// GPI OpenEdge HostPay
    /// </summary>
    OpenEdge = 0,

    /// <summary>
    /// GPI Transactions UI
    /// </summary>
    TransactionsUI = 1
}

export const PaymentProviderLabels: Record<PaymentProvider, string> = {
    [PaymentProvider.OpenEdge]: 'OpenEdge HostPay',
    [PaymentProvider.TransactionsUI]: 'Global Payments Integrated'
} as const;

