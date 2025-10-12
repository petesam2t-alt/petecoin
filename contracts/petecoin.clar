;; title: PeteCoin - A Fungible Token for Pet Lovers
;; version: 1.0.0
;; summary: A SIP-010 compliant fungible token representing PeteCoin (PETE)
;; description: PeteCoin is a community token designed for pet enthusiasts,
;;              supporting pet-related initiatives and communities.

;; SIP-010 compatible functions (trait implementation can be added later)

;; Token definitions
(define-fungible-token petecoin)

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))

;; Token metadata
(define-constant TOKEN-NAME "PeteCoin")
(define-constant TOKEN-SYMBOL "PETE")
(define-constant TOKEN-DECIMALS u6)
(define-constant TOKEN-URI u"https://petecoin.io/token-metadata.json")

;; Initial supply - 1 billion tokens with 6 decimals
(define-constant TOTAL-SUPPLY u1000000000000000)

;; Data variables
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://petecoin.io/token-metadata.json"))

;; Public functions

;; SIP-010 Functions
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender from) (is-eq contract-caller from)) ERR-NOT-TOKEN-OWNER)
    (ft-transfer? petecoin amount from to)
  )
)

(define-read-only (get-name)
  (ok TOKEN-NAME)
)

(define-read-only (get-symbol)
  (ok TOKEN-SYMBOL)
)

(define-read-only (get-decimals)
  (ok TOKEN-DECIMALS)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance petecoin who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply petecoin))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Administrative functions
(define-public (set-token-uri (value (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (var-set token-uri value)
    (ok true)
  )
)

;; Mint function (only owner can mint)
(define-public (mint (amount uint) (to principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-mint? petecoin amount to)
  )
)

;; Burn function
(define-public (burn (amount uint) (from principal))
  (begin
    (asserts! (or (is-eq tx-sender from) (is-eq contract-caller from)) ERR-NOT-TOKEN-OWNER)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-burn? petecoin amount from)
  )
)

;; Initialize the contract by minting the total supply to the contract owner
(begin
  (try! (ft-mint? petecoin TOTAL-SUPPLY CONTRACT-OWNER))
)

;; Utility functions for community features
(define-public (transfer-memo (amount uint) (to principal) (memo (buff 34)))
  (begin
    (try! (ft-transfer? petecoin amount tx-sender to))
    (print {action: "transfer", sender: tx-sender, recipient: to, amount: amount, memo: memo})
    (ok true)
  )
)

;; Batch transfer function for airdrops
(define-public (batch-transfer (recipients (list 200 {to: principal, amount: uint})))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (fold transfer-to-recipient recipients (ok true))
  )
)

;; Private function for batch transfers
(define-private (transfer-to-recipient (recipient {to: principal, amount: uint}) (previous-response (response bool uint)))
  (match previous-response
    success (ft-transfer? petecoin (get amount recipient) tx-sender (get to recipient))
    error (err error)
  )
)

