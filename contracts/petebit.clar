;; Petebit Fungible Token (PBIT)
;; Simple fungible token implementation for the Stacks blockchain.

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INSUFFICIENT-BALANCE u101)

(define-data-var token-owner principal tx-sender)
(define-data-var total-supply uint u0)

(define-constant token-name "Petebit")
(define-constant token-symbol "PBIT")
(define-constant token-decimals u6)
(define-data-var token-uri (optional (string-utf8 256)) none)

(define-map balances {owner: principal} {balance: uint})

;; Read-only getters
(define-read-only (get-name) token-name)
(define-read-only (get-symbol) token-symbol)
(define-read-only (get-decimals) token-decimals)
(define-read-only (get-total-supply) (var-get total-supply))
(define-read-only (get-balance-of (who principal))
  (default-to u0 (get balance (map-get? balances {owner: who})))
)
(define-read-only (get-token-uri) (var-get token-uri))

;; Helpers
(define-private (is-owner (p principal))
  (is-eq p (var-get token-owner))
)

(define-private (increase-balance (who principal) (amount uint))
  (let ((current (default-to u0 (get balance (map-get? balances {owner: who})))))
    (map-set balances {owner: who} {balance: (+ current amount)})
    true
  )
)

(define-private (decrease-balance (who principal) (amount uint))
  (let ((current (default-to u0 (get balance (map-get? balances {owner: who})))))
    (if (< current amount)
      (err ERR-INSUFFICIENT-BALANCE)
      (begin
        (map-set balances {owner: who} {balance: (- current amount)})
        (ok true)
      )
    )
  )
)

;; Public entrypoints
(define-public (mint (amount uint) (recipient principal))
  (if (is-owner tx-sender)
    (begin
      (increase-balance recipient amount)
      (var-set total-supply (+ (var-get total-supply) amount))
      (ok true)
    )
    (err ERR-NOT-AUTHORIZED)
  )
)

(define-public (burn (amount uint) (owner principal))
  (if (is-eq tx-sender owner)
    (begin
      (try! (decrease-balance owner amount))
      (var-set total-supply (- (var-get total-supply) amount))
      (ok true)
    )
    (err ERR-NOT-AUTHORIZED)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (if (is-eq tx-sender sender)
    (begin
      (try! (decrease-balance sender amount))
      (increase-balance recipient amount)
      (ok true)
    )
    (err ERR-NOT-AUTHORIZED)
  )
)

(define-public (set-token-uri (value (optional (string-utf8 256))))
  (if (is-owner tx-sender)
    (begin
      (var-set token-uri value)
      (ok true)
    )
    (err ERR-NOT-AUTHORIZED)
  )
)

(define-public (transfer-ownership (new-owner principal))
  (if (is-owner tx-sender)
    (begin
      (var-set token-owner new-owner)
      (ok true)
    )
    (err ERR-NOT-AUTHORIZED)
  )
)
