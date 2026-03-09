create database gerenciar_pedidos

use gerenciar_pedidos

CREATE TABLE [Order] (
  orderId       NVARCHAR(100)  PRIMARY KEY,
  value         DECIMAL(18,2)  NOT NULL,
  creationDate  DATETIME2      NOT NULL,
  createdAt     DATETIME2      DEFAULT GETUTCDATE(),
  updatedAt     DATETIME2      DEFAULT GETUTCDATE()
);

CREATE TABLE Items (
  id         INT IDENTITY(1,1) PRIMARY KEY,
  orderId    NVARCHAR(100) REFERENCES [Order](orderId) ON DELETE CASCADE,
  productId  INT           NOT NULL,
  quantity   INT           NOT NULL,
  price      DECIMAL(18,2) NOT NULL
);

select * from [Order]
